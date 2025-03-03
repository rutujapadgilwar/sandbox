import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Divider,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../context/AuthContext';
import { Question, Response, Choice, CacheData } from '../types';

const GET_QUESTIONS = gql`
  query GetQuestions {
    questions(n: 10) {
      id
      questionText
      pubDate
      editDate
      questionType
      choices {
        id
        choiceText
        createdAt
      }
      responses {
        id
        responseText
        createdAt
        choice {
          id
          choiceText
        }
      }
    }
  }
`;

const CREATE_RESPONSE = gql`
  mutation CreateResponse($questionId: ID!, $responseText: String, $choiceId: ID) {
    createResponse(
      questionId: $questionId
      responseText: $responseText
      choiceId: $choiceId
    ) {
      response {
        id
        responseText
        createdAt
        choice {
          id
          choiceText
        }
        question {
          id
          questionText
        }
      }
    }
  }
`;

const ADD_CHOICE = gql`
  mutation AddChoice($questionId: ID!, $choiceText: String!) {
    addChoice(questionId: $questionId, choiceText: $choiceText) {
      choice {
        id
        choiceText
        createdAt
      }
    }
  }
`;

interface AnswerQuestionFormProps {
  question: Question;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AnswerQuestionForm: React.FC<AnswerQuestionFormProps> = ({
  question,
  open,
  onClose,
  onSuccess,
}) => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  
  const [responseText, setResponseText] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [newChoice, setNewChoice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localChoices, setLocalChoices] = useState<Choice[]>(question.choices);

  // Reset local state when question changes
  React.useEffect(() => {
    setLocalChoices(question.choices);
  }, [question]);

  const [createResponse, { loading: responseLoading }] = useMutation(CREATE_RESPONSE, {
    update(cache, { data: { createResponse } }) {
      const existingData = cache.readQuery<CacheData>({
        query: GET_QUESTIONS,
      });

      if (existingData) {
        const updatedQuestions = existingData.questions.map(q => 
          q.id === question.id
            ? { ...q, responses: [...q.responses, createResponse.response] }
            : q
        );

        cache.writeQuery<CacheData>({
          query: GET_QUESTIONS,
          data: { questions: updatedQuestions }
        });
      }
    },
    onCompleted: () => {
      setSuccessMessage('Response submitted successfully!');
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const [addChoice, { loading: addChoiceLoading }] = useMutation(ADD_CHOICE, {
    update(cache, { data: { addChoice } }) {
      const existingData = cache.readQuery<CacheData>({
        query: GET_QUESTIONS,
      });

      if (existingData) {
        const updatedQuestions = existingData.questions.map(q =>
          q.id === question.id
            ? { ...q, choices: [...q.choices, addChoice.choice] }
            : q
        );

        cache.writeQuery<CacheData>({
          query: GET_QUESTIONS,
          data: { questions: updatedQuestions }
        });
      }

      setLocalChoices(prev => [...prev, addChoice.choice]);
    },
    onCompleted: (data) => {
      setSuccessMessage('New choice added successfully!');
      setNewChoice('');
      setSelectedChoice(data.addChoice.choice.id);
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleClose = () => {
    setResponseText('');
    setSelectedChoice('');
    setNewChoice('');
    setError(null);
    setSuccessMessage(null);
    setLocalChoices(question.choices);
    onClose();
  };

  const handleAddChoice = async () => {
    if (!newChoice.trim()) {
      setError('Choice text cannot be empty');
      return;
    }

    if (localChoices.some(c => c.choiceText.toLowerCase() === newChoice.trim().toLowerCase())) {
      setError('This choice already exists');
      return;
    }

    try {
      await addChoice({
        variables: {
          questionId: question.id,
          choiceText: newChoice.trim(),
        },
      });
    } catch (err) {
      // Error is handled by onError callback
    }
  };

  const validateResponse = (): boolean => {
    if (question.questionType === 'MC') {
      if (!selectedChoice) {
        setError('Please select an answer');
        return false;
      }
    } else {
      if (!responseText.trim()) {
        setError('Please provide an answer');
        return false;
      }

      if (responseText.trim().length < 2) {
        setError('Response must be at least 2 characters long');
        return false;
      }

      if (responseText.trim().length > 1000) {
        setError('Response cannot exceed 1000 characters');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateResponse()) {
      return;
    }

    try {
      if (question.questionType === 'MC') {
        await createResponse({
          variables: {
            questionId: question.id,
            choiceId: selectedChoice,
          },
        });
      } else {
        await createResponse({
          variables: {
            questionId: question.id,
            responseText: responseText.trim(),
          },
        });
      }
    } catch (err) {
      // Error is handled by onError callback
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Answer Question</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Question:
          </Typography>
          <Typography variant="body1">
            {question.questionText}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {question.questionType === 'MC' ? (
          <Box>
            <FormControl fullWidth>
              <InputLabel>Select Answer</InputLabel>
              <Select
                value={selectedChoice}
                label="Select Answer"
                onChange={(e) => {
                  setSelectedChoice(e.target.value as string);
                  setError(null);
                }}
              >
                {localChoices.map((choice) => (
                  <MenuItem key={choice.id} value={choice.id}>
                    {choice.choiceText}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {isAdmin && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  label="New Choice"
                  value={newChoice}
                  onChange={(e) => setNewChoice(e.target.value)}
                  fullWidth
                  size="small"
                  disabled={addChoiceLoading}
                />
                <Tooltip title="Add New Choice">
                  <span>
                    <IconButton
                      color="primary"
                      onClick={handleAddChoice}
                      disabled={!newChoice.trim() || addChoiceLoading}
                    >
                      <AddIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            )}
          </Box>
        ) : (
          <TextField
            autoFocus
            margin="dense"
            label="Your Answer"
            fullWidth
            multiline
            rows={4}
            value={responseText}
            onChange={(e) => {
              setResponseText(e.target.value);
              setError(null);
            }}
            error={!!error}
            helperText={
              error || 
              `${responseText.length}/1000 characters${
                responseText.length < 2 ? ' (minimum 2 characters required)' : ''
              }`
            }
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={
            responseLoading || 
            addChoiceLoading || 
            (question.questionType === 'MC' && !selectedChoice) || 
            (question.questionType === 'OE' && (!responseText.trim() || responseText.length < 2))
          }
        >
          Submit Answer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnswerQuestionForm; 