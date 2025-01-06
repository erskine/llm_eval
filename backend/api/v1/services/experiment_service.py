from sqlalchemy.orm import Session
from typing import List, Dict, Optional
import time
import aisuite as ai
import logging
import json

from persistence import schemas
from persistence.models import ExperimentRun, Parameter, ExperimentOutput
from persistence import crud
from ..utils.token_counter import count_tokens
from ..utils.graph_analyzer import GraphAnalyzer

logger = logging.getLogger(__name__)

class ExperimentService:
    async def run_experiment(self, experiment: schemas.ExperimentCreate, db: Session):
        logger.info(f"Received experiment request: {experiment}")
        try:
            # Configure client with explicit timeouts (in seconds)
            client = ai.Client()
            results = []
            
            # Log the experiment data before creating DB entry
            logger.info(f"Creating experiment with data: {experiment.model_dump()}")
            
            # Use crud function to create experiment
            db_experiment = crud.create_experiment(db, experiment)
            logger.info(f"Created experiment in DB with ID: {db_experiment.id}")

            # Save experiment parameters
            parameters = [
                Parameter(name="system_prompt", value=experiment.system_prompt, datatype="str"),
                Parameter(name="user_prompt", value=experiment.user_prompt, datatype="str"),
                Parameter(name="models", value=",".join(experiment.models), datatype="str"),
            ]
            db_experiment.parameters.extend(parameters)
            db.commit()
            
            messages = [
                {"role": "system", "content": experiment.system_prompt},
                {"role": "user", "content": experiment.user_prompt},
            ]
            
            has_error = False  # Track if any model had an error
            
            for model in experiment.models:
                # Count input tokens
                input_tokens = sum(
                    count_tokens(msg["content"], model) for msg in messages
                )
                
                logger.info(f"Input tokens for {model}: {input_tokens}")
                
                try:
                    start_time = time.time()
                    logger.info(f"Calling {model} with {input_tokens} input tokens")
                    response = client.chat.completions.create(
                        model=model,
                        messages=messages,
                        temperature=0.0,
                    )
                    elapsed_time = time.time() - start_time
                    
                    # Count output tokens
                    output_text = response.choices[0].message.content
                    output_tokens = count_tokens(output_text, model)
                    
                    logger.info(f"Output tokens for {model}: {output_tokens}")
                    
                    # Initialize base outputs
                    outputs = [
                        ExperimentOutput(
                            output_name=f"{model}_response",
                            output_value=output_text,
                            output_datatype="str"
                        ),
                        ExperimentOutput(
                            output_name=f"{model}_elapsed_time",
                            output_value=str(elapsed_time),
                            output_datatype="float"
                        ),
                        ExperimentOutput(
                            output_name=f"{model}_input_tokens",
                            output_value=str(input_tokens),
                            output_datatype="int"
                        ),
                        ExperimentOutput(
                            output_name=f"{model}_output_tokens",
                            output_value=str(output_tokens),
                            output_datatype="int"
                        ),
                        ExperimentOutput(
                            output_name=f"{model}_total_tokens",
                            output_value=str(input_tokens + output_tokens),
                            output_datatype="int"
                        ),
                    ]
                    
                    # Analyze graph metrics
                    try:
                        graph_data = json.loads(output_text)
                        graph_metrics = GraphAnalyzer.analyze_graph(graph_data)
                        
                        # Add graph metric outputs
                        graph_outputs = [
                            ExperimentOutput(
                                output_name=f"{model}_{metric_name}",
                                output_value=str(metric_value),
                                output_datatype="int"
                            )
                            for metric_name, metric_value in graph_metrics.items()
                        ]
                        outputs.extend(graph_outputs)
                    except json.JSONDecodeError:
                        logger.warning(f"Could not parse JSON response from {model}")
                    except Exception as graph_error:
                        logger.warning(f"Error analyzing graph metrics for {model}: {str(graph_error)}")
                    
                    # Save all outputs to database
                    db_experiment.outputs.extend(outputs)
                    
                    # Create result dictionary
                    result = {
                        "model": model,
                        "response": output_text,
                        "elapsed_time": elapsed_time,
                        "token_counts": {
                            "input": input_tokens,
                            "output": output_tokens,
                            "total": input_tokens + output_tokens
                        }
                    }
                    results.append(result)
                except Exception as model_error:
                    has_error = True
                    db_experiment.status = "ERROR"  # Set status to ERROR
                    logger.exception(f"Error processing model {model}")
                    
                    # Build detailed error message including cause chain
                    error_chain = []
                    current_error = model_error
                    while current_error is not None:
                        error_msg = str(current_error)
                        if hasattr(current_error, 'response'):
                            error_msg += f"\nResponse status: {current_error.response.status_code}"
                            error_msg += f"\nResponse body: {current_error.response.text}"
                        error_chain.append(error_msg)
                        current_error = current_error.__cause__

                    detailed_error = "\nCaused by: ".join(error_chain)
                    error_msg = f"Error with {model}:\n{detailed_error}"
                    
                    outputs = [
                        ExperimentOutput(
                            output_name=f"{model}_error",
                            output_value=error_msg,
                            output_datatype="str"
                        ),
                        ExperimentOutput(
                            output_name=f"{model}_input_tokens",
                            output_value=str(input_tokens),
                            output_datatype="int"
                        )
                    ]
                    db_experiment.outputs.extend(outputs)
                    db.commit()
                    
                    # Add error result
                    result = {
                        "model": model,
                        "response": f"Error: {error_msg}",
                        "elapsed_time": 0,
                        "token_counts": {
                            "input": input_tokens,
                            "output": 0,
                            "total": input_tokens
                        }
                    }
                    results.append(result)
                    continue
            
            # Update experiment status only if no errors occurred
            if not has_error:
                db_experiment.status = "COMPLETED"
            db.commit()
            
            return {
                "id": db_experiment.id,
                "experiment_config": experiment.model_dump(),
                "results": results,
                "status": db_experiment.status,
                "error_details": None
            }
        except Exception as e:
            logger.exception("Error processing experiment")
            if 'db_experiment' in locals():
                db_experiment.status = "ERROR"
                error_output = ExperimentOutput(
                    output_name="error_details",
                    output_value=str(e),
                    output_datatype="str"
                )
                db_experiment.outputs.append(error_output)
                db.commit()
                
                return {
                    "id": db_experiment.id,
                    "experiment_config": experiment.model_dump(),
                    "results": [],
                    "status": "ERROR",
                    "error_details": str(e)
                }
            raise e

    def get_experiment(self, experiment_id: int, db: Session):
        experiment = crud.get_experiment(db, experiment_id)
        if experiment is None:
            raise Exception("Experiment not found")
        
        return {
            "id": experiment.id,
            "name": experiment.name,
            "timestamp": experiment.timestamp,
            "description": experiment.description,
            "status": experiment.status,
            "parameters": {p.name: p.value for p in experiment.parameters},
            "outputs": {o.output_name: o.output_value for o in experiment.outputs}
        }

    def list_experiments(self, db: Session):
        experiments = crud.get_experiments(db)
        return [
            {
                "id": exp.id,
                "name": exp.name or f"Experiment #{exp.id}",
                "timestamp": exp.timestamp,
                "description": exp.description,
                "status": exp.status
            }
            for exp in experiments
        ] 