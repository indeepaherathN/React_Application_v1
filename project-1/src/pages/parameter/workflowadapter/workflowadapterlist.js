import React, { useState } from 'react';
import {
  Button,
  Dialog,
  CircularProgress,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  InputLabel,
  Stack,
  TextField,
  Slide,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Backdrop,
  Typography
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Form, FormikProvider, useFormik } from 'formik';
import { PlusOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import axios from 'axios';
import AddWorkflowAdapter from './AddWorkflowAdapter';
import Swal from 'sweetalert2';
//import { CloseOutlined } from '@ant-design/icons';

const getInitialValues = () => {
  return {
    fromDate: null,
    toDate: null,
    statusList: '',
    workFlowRequestType: ''
  };
};

const WorflowAdapter = () => {
  const [responseData, setResponseData] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const formik = useFormik({
    initialValues: getInitialValues(),

    onSubmit: async (values) => {
      try {
        setLoading(true);
        const { fromDate, toDate, statusList, workFlowRequestType } = values;

        const companyId = localStorage.getItem('companyId');
        const userId = localStorage.getItem('userId');
        const baseUrl = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.post(
          `${baseUrl}/workflowAdapter/workflow-adapter/enteredRequest`,
          {
            fromDate,
            toDate,
            statusList: [statusList],
            workFlowRequestType
          },
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
    setFromDate(null);
    setToDate(null);
    setResponseData(null);
  };

  const handleCancel = async (workflowId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to cancel this request.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, cancel it!'
      });

      if (result.isConfirmed) {
        const companyId = localStorage.getItem('companyId');
        const userId = localStorage.getItem('userId');
        const baseUrl = process.env.REACT_APP_API_BASE_URL;
        await axios.post(
          `${baseUrl}/workflowAdapter/workflow-adapter/cancelReq`,
          {},
          {
            headers: {
              companyId: companyId,
              userId: userId,
              'request-id': '123',
              workflowId: workflowId
            }
          }
        );

        const updatedRequests = responseData.requestList.filter((request) => request.workflowId !== workflowId);
        setResponseData({ ...responseData, requestList: updatedRequests });

        Swal.fire('Cancelled!', 'Your request has been cancelled.', 'success');
      }
    } catch (error) {
      console.error('API Error:', error);

      Swal.fire('Error!', 'Failed to cancel the request.', 'error');
    }
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={formik.handleSubmit}>
          <Divider />
          <DialogContent sx={{ p: 5.5, maxWidth: '600px', maxHeight: '800px', overflow: 'auto' }}>
            <Grid container spacing={3} direction="row" alignItems="center">
              <Grid item xs={6}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Stack spacing={1.25}>
                      <InputLabel sx={{ color: 'black', fontWeight: 'bold' }} htmlFor="fromDate">
                        From Date
                      </InputLabel>
                      <DesktopDatePicker
                        label="From Date"
                        value={fromDate}
                        onChange={(newValue) => {
                          setFromDate(newValue);
                          formik.setFieldValue('fromDate', newValue);
                        }}
                        inputFormat="dd/MM/yyyy"
                        renderInput={(params) => <TextField {...params} sx={{ width: '80%' }} />}
                        error={Boolean(touched.fromDate && errors.fromDate)}
                        helperText={touched.fromDate && errors.fromDate}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack spacing={1.25}>
                      <InputLabel sx={{ color: 'black', fontWeight: 'bold' }} htmlFor="statusList">
                        Status
                      </InputLabel>
                      <Select
                        fullWidth
                        id="statusList"
                        {...getFieldProps('statusList')}
                        value={formik.values.statusList}
                        error={Boolean(touched.statusList && errors.statusList)}
                        sx={{ width: '80%' }}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Please Select---
                        </MenuItem>
                        <MenuItem value="VERIFIED">VERIFIED</MenuItem>
                        <MenuItem value="PENDING">PENDING</MenuItem>
                      </Select>
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={6}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Stack spacing={1.25}>
                      <InputLabel sx={{ color: 'black', fontWeight: 'bold' }} htmlFor="toDate">
                        To Date
                      </InputLabel>
                      <DesktopDatePicker
                        label="To Date"
                        value={toDate}
                        onChange={(newValue) => {
                          setToDate(newValue);
                          formik.setFieldValue('toDate', newValue);
                        }}
                        inputFormat="dd/MM/yyyy"
                        renderInput={(params) => <TextField {...params} sx={{ width: '80%' }} />}
                        error={Boolean(touched.toDate && errors.toDate)}
                        helperText={touched.toDate && errors.toDate}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack spacing={1.25}>
                      <InputLabel sx={{ color: 'black', fontWeight: 'bold' }} htmlFor="workFlowRequestType">
                        WorkFlow Request Type
                      </InputLabel>
                      <Select
                        fullWidth
                        id="workFlowRequestType"
                        {...getFieldProps('workFlowRequestType')}
                        value={formik.values.workFlowRequestType}
                        error={Boolean(touched.workFlowRequestType && errors.workFlowRequestType)}
                        sx={{ width: '80%' }}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Please Select---
                        </MenuItem>
                        <MenuItem value="OWN_TRANSFER">OWN_TRANSFER</MenuItem>
                        <MenuItem value="CM_BRANCH">CM_BRANCH</MenuItem>
                      </Select>
                    </Stack>
                  </Grid>
                </Grid>
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
                    Show Entered Requests
                  </Button>
                  <Button
                    variant="contained"
                    style={{ backgroundColor: '#2979ff', color: 'white' }}
                    startIcon={<PlusOutlined />}
                    onClick={handleOpenDialog}
                  >
                    Add New Transfer
                  </Button>

                  <Dialog
                    fullScreen
                    TransitionComponent={Slide}
                    keepMounted
                    onClose={handleCloseDialog}
                    open={isDialogOpen}
                    sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
                    aria-describedby="alert-dialog-slide-description"
                  >
                    <AddWorkflowAdapter open={isDialogOpen} onClose={handleCloseDialog} />
                  </Dialog>
                  {loading && <CircularProgress size={24} />}
                </Stack>
              </Grid>
            </Grid>
          </DialogActions>
        </Form>
      </FormikProvider>

      {responseData && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#9e9e9e' }}>Workflow Id</TableCell>
                <TableCell sx={{ backgroundColor: '#9e9e9e' }}>Action</TableCell>
                <TableCell sx={{ backgroundColor: '#9e9e9e' }}>Company ID</TableCell>
                <TableCell sx={{ backgroundColor: '#9e9e9e' }}>Created By</TableCell>
                <TableCell sx={{ backgroundColor: '#9e9e9e' }}>Created Date</TableCell>
                <TableCell sx={{ backgroundColor: '#9e9e9e' }}>Last Updated By</TableCell>
                <TableCell sx={{ backgroundColor: '#9e9e9e' }}>Last Updated On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {responseData.requestList.map((request, index) => (
                <TableRow key={index}>
                  <TableCell>{request.workflowId}</TableCell>
                  <TableCell>{request.action}</TableCell>
                  <TableCell>{request.companyId}</TableCell>
                  <TableCell>{request.createdBy}</TableCell>
                  <TableCell>{request.createdDate}</TableCell>
                  <TableCell>{request.lastUpdatedBy}</TableCell>
                  <TableCell>{request.lastUpdatedOn}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      // endIcon={<CloseOutlined />}
                      style={{ backgroundColor: '#212121', color: 'white' }}
                      onClick={() => handleCancel(request.workflowId)}
                    >
                      Cancel
                    </Button>

                    {/* <Button
                      variant="contained"
                      color="primary"
                      style={{ backgroundColor: '#007bb2', color: 'white', marginTop: '8px', marginLeft: '1px' }}

                      //onClick={() => handleApprove(request.workflowId)}
                    >
                      Approve
                    </Button> */}
                  </TableCell>
                </TableRow>
              ))}
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

WorflowAdapter.propTypes = {
  addUser: PropTypes.func
};

export default WorflowAdapter;
