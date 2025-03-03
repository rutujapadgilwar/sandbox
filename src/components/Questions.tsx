import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  TableSortLabel,
  Paper,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Box,
  Button,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import InfoIcon from '@mui/icons-material/Info';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '../context/AuthContext';
import { useColorMode } from '../context/ColorModeContext';
import CreateQuestionForm from './CreateQuestionForm';
import EditQuestionForm from './EditQuestionForm';
import AnswerQuestionForm from './AnswerQuestionForm';
import { Question, Response, Choice, CacheData, Order, OrderBy } from '../types';

const GET_QUESTIONS = gql`
  query GetQuestions {
    questions(n:100) {
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
        question {
          id
          questionText
        }
      }
    }
  }
`;

const DELETE_POLL = gql`
  mutation DeletePoll($questionId: ID!) {
    deletePoll(questionId: $questionId) {
      success
    }
  }
`;

const DELETE_RESPONSE = gql`
  mutation DeleteResponse($responseId: ID!) {
    deleteResponse(responseId: $responseId) {
      success
    }
  }
`;

const Row: React.FC<{ 
  question: Question;
  index: number;
  onEdit: (question: Question) => void;
  onAnswer: (question: Question) => void;
  onDelete: (question: Question) => void;
  isAdmin: boolean;
  refetch: () => void;
  isExpanded: boolean;
  onToggleExpand: (questionId: string) => void;
}> = ({ 
  question, 
  index, 
  onEdit, 
  onAnswer, 
  onDelete, 
  isAdmin, 
  refetch,
  isExpanded,
  onToggleExpand
}) => {
  const [deleteResponseId, setDeleteResponseId] = React.useState<string | null>(null);
  const hasDetails = question.questionType === 'MC' || question.responses.length > 0;
  
  const [deleteResponse, { loading: deleteResponseLoading }] = useMutation(DELETE_RESPONSE, {
    update(cache, { data: { deleteResponse } }) {
      if (deleteResponse.success) {
        // Update the cache to remove the deleted response
        const existingData = cache.readQuery<{ questions: Question[] }>({
          query: GET_QUESTIONS,
        });

        if (existingData) {
          const updatedQuestions = existingData.questions.map(q => {
            if (q.id === question.id) {
              return {
                ...q,
                responses: q.responses.filter(r => r.id !== deleteResponseId)
              };
            }
            return q;
          });

          // If this was the last response for an OE question, close the expanded section
          if (question.questionType === 'OE' && 
              question.responses.length === 1 && 
              deleteResponseId === question.responses[0].id) {
            onToggleExpand(question.id);
          }

          cache.writeQuery({
            query: GET_QUESTIONS,
            data: {
              questions: updatedQuestions
            }
          });
        }
      }
    },
    onCompleted: (data) => {
      if (data.deleteResponse.success) {
        setDeleteResponseId(null);
        refetch(); // Refetch to ensure UI is in sync
      }
    },
    onError: (error) => {
      console.error('Failed to delete response:', error);
    },
  });

  const handleDeleteResponse = async (responseId: string) => {
    try {
      await deleteResponse({
        variables: { responseId },
      });
    } catch (error) {
      console.error('Delete response operation failed:', error);
    }
  };
  
  return (
    <>
      <TableRow 
        sx={{ 
          height: '80px',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px -2px rgba(0,0,0,0.1)',
          },
          '& > td': { 
            borderRight: '1px solid rgba(224, 224, 224, 1)',
            borderBottom: '1px solid rgba(224, 224, 224, 1)',
            '&:first-of-type': {
              borderLeft: '1px solid rgba(224, 224, 224, 1)',
            },
            '&:last-child': {
              borderRight: '1px solid rgba(224, 224, 224, 1)'
            }
          }
        }}
      >
        <TableCell align="center">{index}</TableCell>
        <TableCell>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {question.questionText}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {new Date(question.pubDate).toLocaleDateString()}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {new Date(question.pubDate).toLocaleTimeString()}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {question.editDate ? (
              <>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {new Date(question.editDate).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(question.editDate).toLocaleTimeString()}
                </Typography>
              </>
            ) : '-'}
          </Box>
        </TableCell>
        <TableCell align="center">
          <Chip 
            label={question.questionType === 'MC' ? 'Multiple Choice' : 'Open Ended'} 
            color={question.questionType === 'MC' ? 'primary' : 'default'}
            size="small"
            sx={{
              fontWeight: 500,
              '&.MuiChip-colorPrimary': {
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                color: 'white',
              },
              '&.MuiChip-colorDefault': {
                background: 'linear-gradient(45deg, #757575 30%, #9E9E9E 90%)',
                color: 'white',
              }
            }}
          />
        </TableCell>
        <TableCell align="center">
          <Typography variant="body2" sx={{ 
            fontWeight: 500,
            color: question.responses.length > 0 ? 'success.main' : 'text.secondary'
          }}>
            {question.responses.length}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Stack direction="row" spacing={1} justifyContent="center">
            <Tooltip title={!hasDetails ? "No details available" : (isExpanded ? "Hide Details" : "Show Details")}>
              <span>
                <IconButton 
                  size="small" 
                  onClick={() => hasDetails && onToggleExpand(question.id)}
                  disabled={!hasDetails}
                  sx={{
                    color: isExpanded ? 'primary.main' : 'action.active',
                    opacity: !hasDetails ? 0.5 : 1,
                    '&:hover': {
                      backgroundColor: hasDetails ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                    }
                  }}
                >
                  <InfoIcon />
                </IconButton>
              </span>
            </Tooltip>
            {!isAdmin && (
              <Tooltip title="Answer Question">
                <IconButton 
                  size="small" 
                  onClick={() => onAnswer(question)}
                  sx={{
                    color: 'success.main',
                    '&:hover': {
                      backgroundColor: 'rgba(76, 175, 80, 0.04)',
                    }
                  }}
                >
                  <QuestionAnswerIcon />
                </IconButton>
              </Tooltip>
            )}
            {isAdmin && (
              <>
                <Tooltip title="Edit Question">
                  <IconButton 
                    size="small" 
                    onClick={() => onEdit(question)}
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Question">
                  <IconButton 
                    size="small" 
                    onClick={() => onDelete(question)}
                    sx={{
                      color: 'error.main',
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.04)',
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ 
              margin: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              borderRadius: 1,
              p: 2
            }}>
              {question.questionType === 'MC' && (
                <>
                  <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', fontWeight: 500 }}>
                    Choices:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                    {question.choices.map((choice) => (
                      <Chip
                        key={choice.id}
                        label={choice.choiceText}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                          }
                        }}
                      />
                    ))}
                  </Stack>
                </>
              )}

              {question.responses.length > 0 && (
                <>
                  <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', fontWeight: 500 }}>
                    Responses:
                  </Typography>
                  <Table size="small" sx={{ 
                    backgroundColor: 'white',
                    borderRadius: 1,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    '& .MuiTableRow-root:hover': {
                      backgroundColor: 'rgba(0,0,0,0.02)'
                    }
                  }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                        <TableCell sx={{ fontWeight: 'bold', width: '60%' }}>Response</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Timestamp</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {question.responses.map((response) => (
                        <TableRow key={response.id} hover>
                          <TableCell sx={{ 
                            whiteSpace: 'pre-wrap', 
                            wordBreak: 'break-word',
                            fontWeight: 500
                          }}>
                            {response.choice ? response.choice.choiceText : response.responseText}
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>
                            {new Date(response.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Delete Response">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => setDeleteResponseId(response.id)}
                                disabled={deleteResponseLoading}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: 'rgba(211, 47, 47, 0.04)',
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {/* Delete Response Confirmation Dialog */}
      <Dialog
        open={!!deleteResponseId}
        onClose={() => setDeleteResponseId(null)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          color: 'error.main'
        }}>
          Delete Response
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography gutterBottom>
            Are you sure you want to delete this response?
          </Typography>
          <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)', p: 2 }}>
          <Button 
            onClick={() => setDeleteResponseId(null)}
            disabled={deleteResponseLoading}
            variant="outlined"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (deleteResponseId) {
                handleDeleteResponse(deleteResponseId);
              }
            }}
            color="error"
            variant="contained"
            disabled={deleteResponseLoading}
            sx={{
              background: 'linear-gradient(45deg, #f44336 30%, #ff1744 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #d32f2f 30%, #f50057 90%)',
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const Questions: React.FC = () => {
  const { role, setRole } = useAuth();
  const isAdmin = role === 'admin';
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [answerQuestion, setAnswerQuestion] = useState<Question | null>(null);
  const [deleteQuestion, setDeleteQuestion] = useState<Question | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('pubDate');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  
  const { loading, error, data, refetch } = useQuery(GET_QUESTIONS);

  const [deletePoll, { loading: deleteLoading }] = useMutation(DELETE_POLL, {
    onCompleted: (data) => {
      if (data.deletePoll.success) {
        refetch();
      }
    },
    onError: (error) => {
      console.error('Failed to delete question:', error);
    },
  });

  const handleDelete = (question: Question) => {
    setDeleteQuestion(question);
  };

  const handleConfirmDelete = async () => {
    if (!deleteQuestion) return;
    
    try {
      await deletePoll({
        variables: { questionId: deleteQuestion.id },
      });
      setDeleteQuestion(null);
    } catch (error) {
      console.error('Delete operation failed:', error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0); // Reset to first page when sorting
  };

  const sortQuestions = (questions: Question[]) => {
    // First sort by creation date (newest first) and assign index
    const sortedByDate = [...questions].sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
    
    const questionsWithIndex = sortedByDate.map((q, idx) => ({
      ...q,
      originalIndex: idx + 1
    }));

    // Then sort according to the current sort criteria
    return questionsWithIndex.sort((a, b) => {
      if (orderBy === 'questionType') {
        return order === 'asc'
          ? a.questionType.localeCompare(b.questionType)
          : b.questionType.localeCompare(a.questionType);
      }
      if (orderBy === 'editDate') {
        if (!a.editDate) return order === 'asc' ? -1 : 1;
        if (!b.editDate) return order === 'asc' ? 1 : -1;
        return order === 'asc' 
          ? new Date(a.editDate).getTime() - new Date(b.editDate).getTime()
          : new Date(b.editDate).getTime() - new Date(a.editDate).getTime();
      }
      return order === 'asc'
        ? new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime()
        : new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });
  };

  const handleRoleChange = (
    event: React.MouseEvent<HTMLElement>,
    newRole: string | null
  ) => {
    if (newRole !== null) {
      setRole(newRole as 'user' | 'admin');
      // Clear all expanded states when switching roles
      setExpandedQuestions(new Set());
    }
  };

  const handleToggleExpand = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <Box sx={{ 
      position: 'relative', 
      minHeight: '100vh',
      bgcolor: 'background.default',
      color: 'text.primary',
      transition: 'background-color 0.3s, color 0.3s'
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2, 
        alignItems: 'center', 
        width: '100%' 
      }}>
        <Box sx={{ 
          width: '90%', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2 
        }}>
          <IconButton
            onClick={toggleColorMode}
            sx={{
              ml: 1,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            {theme.palette.mode === 'dark' ? (
              <Brightness7Icon sx={{ color: 'warning.light' }} />
            ) : (
              <Brightness4Icon sx={{ color: 'primary.main' }} />
            )}
          </IconButton>

          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={handleRoleChange}
            aria-label="role selection"
            sx={{
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 2px 4px rgba(0,0,0,0.2)' 
                : '0 2px 4px rgba(0,0,0,0.1)',
              borderRadius: '28px',
              padding: '4px',
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '24px',
                mx: 0.5,
                px: 3,
                py: 1,
                textTransform: 'none',
                color: theme.palette.mode === 'dark' ? 'text.primary' : 'inherit',
                '&.Mui-selected': {
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, #1976D2 30%, #0D47A1 90%)'
                    : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  color: 'white',
                  '&:hover': {
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(45deg, #1565C0 30%, #0D47A1 90%)'
                      : 'linear-gradient(45deg, #1976D2 30%, #00B8D4 90%)',
                  },
                },
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)' 
                    : 'rgba(0, 0, 0, 0.04)',
                },
              },
            }}
          >
            <ToggleButton 
              value="user" 
              aria-label="user mode"
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
              }}
            >
              <PersonIcon />
              <Typography sx={{ fontWeight: 500 }}>User Mode</Typography>
            </ToggleButton>
            <ToggleButton 
              value="admin" 
              aria-label="admin mode"
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
              }}
            >
              <AdminPanelSettingsIcon />
              <Typography sx={{ fontWeight: 500 }}>Admin Mode</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <TableContainer 
          component={Paper} 
          sx={{ 
            maxWidth: '90%',
            width: '100%',
            mb: 4,
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'white',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 16px -4px rgba(0,0,0,0.3), 0 0 8px -4px rgba(0,0,0,0.2)'
              : '0 8px 16px -4px rgba(0,0,0,0.1), 0 0 8px -4px rgba(0,0,0,0.05)',
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(224, 224, 224, 1)'}`,
            '& .MuiTable-root': {
              borderCollapse: 'separate',
              borderSpacing: 0,
            },
            '& .MuiTableCell-root': {
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(224, 224, 224, 1)',
            },
            '& .MuiTableHead-root .MuiTableRow-root': {
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
                : 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
            }
          }}
        >
          <Table aria-label="questions table">
            <TableHead>
              <TableRow sx={{ 
                height: '64px',
                background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
                '& > th': { 
                  fontWeight: 'bold',
                  fontSize: '1.3rem',
                  textAlign: 'center',
                  borderRight: '1px solid rgba(224, 224, 224, 1)',
                  borderBottom: '2px solid rgba(224, 224, 224, 1)',
                  '&:first-of-type': {
                    borderLeft: '1px solid rgba(224, 224, 224, 1)',
                  },
                  '&:last-child': {
                    borderRight: '1px solid rgba(224, 224, 224, 1)'
                  }
                }
              }}>
                <TableCell align="center" sx={{ width: '5%' }}>#</TableCell>
                <TableCell sx={{ width: '30%' }}>Question</TableCell>
                <TableCell sx={{ width: '15%' }}>
                  <TableSortLabel
                    active={orderBy === 'pubDate'}
                    direction={orderBy === 'pubDate' ? order : 'asc'}
                    onClick={() => handleRequestSort('pubDate')}
                  >
                    Created
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: '15%' }}>
                  <TableSortLabel
                    active={orderBy === 'editDate'}
                    direction={orderBy === 'editDate' ? order : 'asc'}
                    onClick={() => handleRequestSort('editDate')}
                  >
                    Last Modified
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: '10%' }}>
                  <TableSortLabel
                    active={orderBy === 'questionType'}
                    direction={orderBy === 'questionType' ? order : 'asc'}
                    onClick={() => handleRequestSort('questionType')}
                  >
                    Type
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: '10%' }}>Responses</TableCell>
                <TableCell sx={{ width: '15%' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortQuestions(data.questions)
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((question: Question & { originalIndex: number }) => (
                  <Row 
                    key={question.id} 
                    question={question}
                    index={question.originalIndex}
                    onEdit={setEditQuestion}
                    onAnswer={setAnswerQuestion}
                    onDelete={handleDelete}
                    isAdmin={isAdmin}
                    refetch={refetch}
                    isExpanded={expandedQuestions.has(question.id)}
                    onToggleExpand={handleToggleExpand}
                  />
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10]}
            component="div"
            count={data.questions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
          />
        </TableContainer>
      </Box>

      {isAdmin && (
        <Fab 
          color="primary" 
          aria-label="add"
          onClick={() => setIsCreateModalOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
          }}
        >
          <AddIcon />
        </Fab>
      )}

      <Dialog
        open={!!deleteQuestion}
        onClose={() => setDeleteQuestion(null)}
      >
        <DialogTitle>Delete Question</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to delete this question?
          </Typography>
          {deleteQuestion && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Question: "{deleteQuestion.questionText}"
            </Typography>
          )}
          <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteQuestion(null)}
            disabled={deleteLoading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <CreateQuestionForm
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          refetch();
          setIsCreateModalOpen(false);
        }}
      />

      {editQuestion && (
        <EditQuestionForm
          question={editQuestion}
          open={!!editQuestion}
          onClose={() => setEditQuestion(null)}
          onSuccess={() => {
            refetch();
            setEditQuestion(null);
          }}
        />
      )}

      {answerQuestion && (
        <AnswerQuestionForm
          question={answerQuestion}
          open={!!answerQuestion}
          onClose={() => setAnswerQuestion(null)}
          onSuccess={() => {
            refetch();
            setAnswerQuestion(null);
          }}
        />
      )}
    </Box>
  );
};

export default Questions; 