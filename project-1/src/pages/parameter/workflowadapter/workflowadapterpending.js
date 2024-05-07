import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  InputLabel,
  Stack,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Backdrop,
  Typography,
  FormControl,
  Select
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Form, FormikProvider, useFormik } from 'formik';
import axios from 'axios';

const getInitialValues = () => {
  return {
    status: '',
    domain: '',
    workflowReqTypeList: ''
  };
};

const WorflowAdapter = () => {
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workflowDetails, setWorkflowDetails] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [comment, setComment] = useState('');

  const formik = useFormik({
    initialValues: getInitialValues(),

    onSubmit: async (values) => {
      try {
        setLoading(true);

        const { workflowReqTypeList, domain } = values;

        const companyId = localStorage.getItem('companyId');
        const userId = localStorage.getItem('userId');

        const baseUrl = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.post(
          `${baseUrl}/workflowAdapter/workflow-adapter/pendingWFReq`,
          { domain, workflowReqTypeList: [workflowReqTypeList] },
          {
            headers: {
              companyId: companyId,
              userId: userId,
              'request-id': '123'
            }
          }
        );

        setResponseData(response.data);
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    }
  });

  const { errors, touched, getFieldProps, resetForm } = formik;

  const handleReset = () => {
    resetForm();
    setResponseData(null);
  };

  const handleViewDetails = async (workflowId) => {
    try {
      const companyId = localStorage.getItem('companyId');
      const userId = localStorage.getItem('userId');
      const baseUrl = process.env.REACT_APP_API_BASE_URL;

      const response = await axios.get(`${baseUrl}/workflowAdapter/workflow-adapter/pendingWFReqById/${workflowId}`, {
        headers: {
          companyId: companyId,
          userId: userId,
          domain: 'SINGLE_TRANSFER',
          'request-id': '123'
        }
      });

      setWorkflowDetails(response.data);
      setOpenDialog(true);
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  const handleReject = async (workflowId, option, level) => {
    setLoading(true);
    const companyId = localStorage.getItem('companyId');
    const userId = localStorage.getItem('userId');
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    if (!comment.trim()) {
      alert('Please enter a comment before rejecting.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/workflowAdapter/workflow-adapter/approve`,
        {
          workflowId,
          comment,
          option,
          status: 'REJECTED',
          level
        },
        {
          headers: {
            companyId: companyId,
            userId: userId,
            'request-id': '123'
          }
        }
      );

      if (response.data.responseCode === 200) {
        alert('Rejecting is Successful!');
      } else {
        alert('Rejecting Failed: ' + response.data.responseMessage);
      }
    } catch (error) {
      console.error('Error rejecting workflow:', error);
      alert('Rejecting Failed: An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (workflowId, option, level) => {
    setLoading(true);
    const companyId = localStorage.getItem('companyId');
    const userId = localStorage.getItem('userId');
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    // if (!comment.trim()) {
    //   alert('Please enter a comment before approving.');
    //   setLoading(false);
    //   return;
    // }

    try {
      const response = await axios.post(
        `${baseUrl}/workflowAdapter/workflow-adapter/approve`,
        {
          workflowId,
          comment,
          option,
          status: 'APPROVED',
          level
        },
        {
          headers: {
            companyId: companyId,
            userId: userId,
            'request-id': '123'
          }
        }
      );

      if (response.data.responseCode === 200) {
        alert('Approving is Successful!');
      } else {
        alert('Approving Failed: ' + response.data.responseMessage);
      }
    } catch (error) {
      console.error('Error Approving workflow:', error);
      alert('Approving Failed: An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={formik.handleSubmit}>
          <Divider />
          <DialogContent sx={{ p: 5.5, maxWidth: '700px', maxHeight: '800px', overflow: 'auto' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={4}>
                <InputLabel sx={{ color: 'black', fontWeight: 'bold' }} htmlFor="domain">
                  Domain
                </InputLabel>
                <Select
                  fullWidth
                  id="domain"
                  {...getFieldProps('domain')}
                  value={formik.values.domain}
                  error={Boolean(touched.domain && errors.domain)}
                  sx={{ width: '100%' }}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Please Select---
                  </MenuItem>
                  <MenuItem value="SINGLE_TRANSFER">SINGLE_TRANSFER</MenuItem>
                  <MenuItem value="OWN_TRANSFER">OWN_TRANSFER</MenuItem>
                </Select>
              </Grid>

              <Grid item xs={4}>
                <InputLabel sx={{ color: 'black', fontWeight: 'bold' }} htmlFor="workflowReqTypeList">
                  WorkFlow Request Type
                </InputLabel>
                <Select
                  fullWidth
                  id="workflowReqTypeList"
                  {...getFieldProps('workflowReqTypeList')}
                  value={formik.values.workflowReqTypeList}
                  error={Boolean(touched.workflowReqTypeList && errors.workflowReqTypeList)}
                  sx={{ width: '100%' }}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Please Select---
                  </MenuItem>
                  <MenuItem value="OWN_TRANSFER">OWN_TRANSFER</MenuItem>
                  <MenuItem value="CM_BRANCH">CM_BRANCH</MenuItem>
                </Select>
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />

          <DialogActions sx={{ p: 2.5 }}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleReset}
                  sx={{
                    backgroundColor: '#f50057',
                    fontWeight: 'bold',
                    '&:hover': { backgroundColor: '#f50057' },
                    marginTop: '10px',
                    marginLeft: '8px'
                  }}
                >
                  Reset
                </Button>
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button type="submit" variant="contained">
                    Show Pending Requests
                  </Button>

                  {loading && <CircularProgress size={24} />}
                </Stack>
              </Grid>
            </Grid>
          </DialogActions>
        </Form>
      </FormikProvider>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogContent>
          {workflowDetails && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Domain"
                  value={workflowDetails.authpendingTransfer[0].assignBeans[0].domain || ''}
                  readOnly
                  disabled
                  // InputProps={{
                  //   readOnly: true,
                  //   style: { color: 'red' }
                  // }}
                  InputLabelProps={{
                    readOnly: true,
                    style: { color: '#0277bd' }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Action"
                  value={workflowDetails.authpendingTransfer[0].assignBeans[0].action || ''}
                  readOnly
                  disabled
                  InputLabelProps={{
                    readOnly: true,
                    style: { color: '#0277bd' }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Type"
                  value={workflowDetails.authpendingTransfer[0].assignBeans[0].type || ''}
                  readOnly
                  disabled
                  InputLabelProps={{
                    readOnly: true,
                    style: { color: '#0277bd' }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Rule ID"
                  value={workflowDetails.authpendingTransfer[0].assignBeans[0].ruleId || ''}
                  readOnly
                  disabled
                  InputLabelProps={{
                    readOnly: true,
                    style: { color: '#0277bd' }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Option</InputLabel>
                  <Select value={workflowDetails.authpendingTransfer[0].assignBeans[0].optionList[0].option || ''} readOnly disabled>
                    {workflowDetails.authpendingTransfer[0].assignBeans[0].optionList.map((option, idx) => (
                      <MenuItem key={idx} value={option.option}>
                        {option.option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={workflowDetails.authpendingTransfer[0].assignBeans[0].optionList[0].levelList[0].level || ''}
                    readOnly
                    disabled
                  >
                    {workflowDetails.authpendingTransfer[0].assignBeans[0].optionList[0].levelList.map((level, idx) => (
                      <MenuItem key={idx} value={level.level}>
                        {level.level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Add a Comment to Reject"
                  multiline
                  rows={1}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              style={{ backgroundColor: '#03a9f4', color: 'white' }}
              onClick={() =>
                handleApprove(
                  workflowDetails.authpendingTransfer[0].assignBeans[0].workflowId,
                  workflowDetails.authpendingTransfer[0].assignBeans[0].optionList[0].option,
                  workflowDetails.authpendingTransfer[0].assignBeans[0].optionList[0].levelList[0].level
                )
              }
            >
              Approve
            </Button>

            <Button
              variant="contained"
              color="primary"
              style={{ backgroundColor: '#f50057', color: 'white' }}
              onClick={() =>
                handleReject(
                  workflowDetails.authpendingTransfer[0].assignBeans[0].workflowId,
                  workflowDetails.authpendingTransfer[0].assignBeans[0].optionList[0].option,
                  workflowDetails.authpendingTransfer[0].assignBeans[0].optionList[0].levelList[0].level
                )
              }
            >
              Reject
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenDialog(false)}
              sx={{
                backgroundColor: '#212121',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#212121' }
              }}
            >
              Close
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
      {responseData && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#9e9e9e' }}>Workflow Id</TableCell>
                <TableCell sx={{ backgroundColor: '#9e9e9e' }}>CompanyId</TableCell>
                <TableCell sx={{ backgroundColor: '#9e9e9e' }}>Action</TableCell>
                <TableCell sx={{ backgroundColor: '#9e9e9e' }}>Request Type</TableCell>
                <TableCell sx={{ backgroundColor: '#9e9e9e' }}>Status</TableCell>
                <TableCell sx={{ backgroundColor: '#9e9e9e' }}>Reference ID</TableCell>
                <TableCell sx={{ backgroundColor: '#9e9e9e' }}>Open Date</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {responseData.authpendingTransfer.map((request) =>
                request.assignBeans.map((request, index) => (
                  <TableRow key={index}>
                    <TableCell>{request.workflowId}</TableCell>
                    <TableCell>{request.companyId}</TableCell>
                    <TableCell>{request.action}</TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>{request.status}</TableCell>
                    <TableCell>{request.referenceId}</TableCell>
                    <TableCell>{request.openDate}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        style={{ backgroundColor: '#4caf50', color: 'white' }}
                        onClick={() => handleViewDetails(request.workflowId)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
        <Typography variant="h6" color="inherit" sx={{ ml: 2 }}>
          Loading...
        </Typography>
      </Backdrop>
    </LocalizationProvider>
  );
};

WorflowAdapter.propTypes = {};

export default WorflowAdapter;
