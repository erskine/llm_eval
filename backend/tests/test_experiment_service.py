import pytest
from unittest.mock import Mock, patch, MagicMock
from sqlalchemy.orm import Session
from datetime import datetime

from api.v1.services.experiment_service import ExperimentService
from persistence import schemas
from persistence.models import ExperimentRun, Parameter, ExperimentOutput

@pytest.fixture
def service():
    return ExperimentService()

@pytest.fixture
def mock_db():
    return Mock(spec=Session)

@pytest.fixture
def sample_experiment():
    return schemas.ExperimentCreate(
        name="Test Experiment",
        description="Test Description",
        system_prompt="You are a helpful assistant",
        user_prompt="Tell me a joke",
        models=["openai:gpt-4o-mini", "anthropic:claude-3-5-sonnet-20241022"]
    )

@pytest.mark.asyncio
@patch('api.v1.services.experiment_service.ai.Client')
@patch('api.v1.services.experiment_service.crud')
async def test_run_experiment_success(mock_crud, mock_client, service, mock_db, sample_experiment):
    # Setup mock responses
    mock_chat_completion = Mock()
    mock_chat_completion.choices = [Mock(message=Mock(content="Test response"))]
    
    mock_client_instance = Mock()
    mock_client_instance.chat.completions.create.return_value = mock_chat_completion
    mock_client.return_value = mock_client_instance

    # Mock database operations
    mock_experiment = Mock(
        id=1,
        name="Test Experiment",
        timestamp=datetime.now(),
        status="RUNNING",
        parameters=[],
        outputs=[]
    )
    mock_crud.create_experiment.return_value = mock_experiment

    # Run the experiment
    result = await service.run_experiment(sample_experiment, mock_db)

    # Assertions
    assert result["status"] == "COMPLETED"
    assert len(result["results"]) == 2  # Two models
    mock_crud.create_experiment.assert_called_once()
    assert mock_client_instance.chat.completions.create.call_count == 2

@pytest.mark.asyncio
@patch('api.v1.services.experiment_service.ai.Client')
@patch('api.v1.services.experiment_service.crud')
async def test_run_experiment_with_error(mock_crud, mock_client, service, mock_db, sample_experiment):
    # Setup mock to raise an exception
    mock_client_instance = Mock()
    mock_client_instance.chat.completions.create.side_effect = Exception("API Error")
    mock_client.return_value = mock_client_instance

    # Mock database operations
    mock_experiment = Mock(
        id=1,
        name="Test Experiment",
        timestamp=datetime.now(),
        status="RUNNING",
        parameters=[],
        outputs=[]
    )
    mock_crud.create_experiment.return_value = mock_experiment

    # Run the experiment
    result = await service.run_experiment(sample_experiment, mock_db)

    # Assertions
    assert result["status"] == "ERROR"
    assert any("API Error" in output.output_value 
              for output in mock_experiment.outputs)
    mock_crud.create_experiment.assert_called_once()

@patch('api.v1.services.experiment_service.crud')
def test_get_experiment_success(mock_crud, service, mock_db):
    # Mock crud response
    mock_experiment = Mock(
        id=1,
        name="Test Experiment",
        timestamp=datetime.now(),
        description="Test Description",
        status="COMPLETED",
        parameters=[
            Parameter(name="system_prompt", value="test prompt", datatype="str")
        ],
        outputs=[
            ExperimentOutput(output_name="result", output_value="test output", output_datatype="str")
        ]
    )
    
    mock_crud.get_experiment.return_value = mock_experiment
    result = service.get_experiment(1, mock_db)

    assert result["id"] == 1
    assert result["status"] == "COMPLETED"
    assert "system_prompt" in result["parameters"]
    assert "result" in result["outputs"]

@patch('api.v1.services.experiment_service.crud')
def test_get_experiment_not_found(mock_crud, service, mock_db):
    mock_crud.get_experiment.return_value = None
    with pytest.raises(Exception) as exc_info:
        service.get_experiment(999, mock_db)
    
    assert "Experiment not found" in str(exc_info.value)