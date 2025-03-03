import React, { useState, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Chip,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const UPDATE_POLL = gql`
  mutation UpdatePoll(
    $questionId: ID!
    $question: String!
    $questionType: String!
    $choices: [String!]
  ) {
    updatePoll(
      questionId: $questionId
      question: $question
      questionType: $questionType
      choices: $choices
    ) {
      id
      questionText
      editDate
      questionType
      choices {
        id
        choiceText
      }
    }
  }
`;

interface Choice {
  id: string;
  choiceText: string;
}

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  choices: Choice[];
}

interface EditQuestionFormProps {
  question: Question;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditQuestionForm: React.FC<EditQuestionFormProps> = ({
  question,
  open,
  onClose,
  onSuccess,
}) => {
  const [questionText, setQuestionText] = useState(question.questionText);
  const [questionType, setQuestionType] = useState(question.questionType);
  const [choices, setChoices] = useState<string[]>(
    question.choices.map(c => c.choiceText)
  );
  const [newChoice, setNewChoice] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuestionText(question.questionText);
    setQuestionType(question.questionType);
    setChoices(question.choices.map(c => c.choiceText));
  }, [question]);

  const [updatePoll, { loading }] = useMutation(UPDATE_POLL, {
    onCompleted: () => {
      onSuccess();
      handleClose();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleClose = () => {
    setQuestionText(question.questionText);
    setQuestionType(question.questionType);
    setChoices(question.choices.map(c => c.choiceText));
    setNewChoice('');
    setError(null);
    onClose();
  };

  const handleAddChoice = () => {
    if (newChoice.trim() && !choices.includes(newChoice.trim())) {
      setChoices([...choices, newChoice.trim()]);
      setNewChoice('');
    }
  };

  const handleRemoveChoice = (choiceToRemove: string) => {
    if (choices.length <= 2) {
      setError('Multiple choice questions require at least 2 choices');
      return;
    }
    setChoices(choices.filter(choice => choice !== choiceToRemove));
  };

  const validateForm = (): boolean => {
    if (!questionText.trim()) {
      setError('Question text is required');
      return false;
    }

    if (questionType === 'MC') {
      if (choices.length < 2) {
        setError('Multiple choice questions require at least 2 choices');
        return false;
      }

      if (choices.some(choice => !choice.trim())) {
        setError('Choice text cannot be empty');
        return false;
      }

      if (new Set(choices).size !== choices.length) {
        setError('Duplicate choices are not allowed');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    updatePoll({
      variables: {
        questionId: question.id,
        question: questionText.trim(),
        questionType: questionType,
        choices: questionType === 'MC' ? choices : null,
      },
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Question</DialogTitle>
      <DialogContent>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Question Text"
          fullWidth
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          error={!questionText.trim()}
          helperText={!questionText.trim() ? 'Question text is required' : ''}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Question Type</InputLabel>
          <Select
            value={questionType}
            label="Question Type"
            onChange={(e) => {
              setQuestionType(e.target.value);
              if (e.target.value === 'OE') {
                setChoices([]);
              }
            }}
          >
            <MenuItem value="OE">Open Ended</MenuItem>
            <MenuItem value="MC">Multiple Choice</MenuItem>
          </Select>
        </FormControl>

        {questionType === 'MC' && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="Add Choice"
                value={newChoice}
                onChange={(e) => setNewChoice(e.target.value)}
                fullWidth
                error={!!newChoice.trim() && choices.includes(newChoice.trim())}
                helperText={
                  newChoice.trim() && choices.includes(newChoice.trim())
                    ? 'This choice already exists'
                    : ''
                }
              />
              <Button
                variant="contained"
                onClick={handleAddChoice}
                disabled={!newChoice.trim() || choices.includes(newChoice.trim())}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
              {choices.map((choice, index) => (
                <Chip
                  key={index}
                  label={choice}
                  onDelete={() => handleRemoveChoice(choice)}
                  sx={{ mb: 1 }}
                  color={choices.length <= 2 ? 'warning' : 'default'}
                />
              ))}
            </Stack>
            {choices.length < 2 && (
              <Typography color="warning" variant="caption" display="block">
                Add at least {2 - choices.length} more choice{choices.length === 0 ? 's' : ''}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || (questionType === 'MC' && choices.length < 2) || !questionText.trim()}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditQuestionForm; 