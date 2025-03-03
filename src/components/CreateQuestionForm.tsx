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
  Box,
  IconButton,
  Chip,
  Stack,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const CREATE_POLL = gql`
  mutation CreatePoll($question: String!, $questionType: String!, $choices: [String!]) {
    createPoll(question: $question, questionType: $questionType, choices: $choices) {
      id
      questionText
      pubDate
      editDate
      questionType
      choices {
        id
        choiceText
      }
    }
  }
`;

interface CreateQuestionFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateQuestionForm: React.FC<CreateQuestionFormProps> = ({ open, onClose, onSuccess }) => {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('OE');
  const [choices, setChoices] = useState<string[]>([]);
  const [newChoice, setNewChoice] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [createPoll, { loading }] = useMutation(CREATE_POLL, {
    onCompleted: () => {
      onSuccess();
      handleClose();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleClose = () => {
    setQuestionText('');
    setQuestionType('OE');
    setChoices([]);
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
    setChoices(choices.filter(choice => choice !== choiceToRemove));
  };

  const handleSubmit = () => {
    if (!questionText.trim()) {
      setError('Question text is required');
      return;
    }

    if (questionType === 'MC' && choices.length < 2) {
      setError('Multiple choice questions require at least 2 choices');
      return;
    }

    createPoll({
      variables: {
        question: questionText.trim(),
        questionType: questionType,
        choices: questionType === 'MC' ? choices : null,
      },
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Question</DialogTitle>
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
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Question Type</InputLabel>
          <Select
            value={questionType}
            label="Question Type"
            onChange={(e) => setQuestionType(e.target.value)}
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
              />
              <Button
                variant="contained"
                onClick={handleAddChoice}
                disabled={!newChoice.trim()}
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
                />
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateQuestionForm; 