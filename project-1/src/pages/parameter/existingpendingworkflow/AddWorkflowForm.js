import React, { useState, useEffect } from 'react';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputLabel,
  Stack,
  TextField,
  Select,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

import { Form, FormikProvider, useFormik } from 'formik';
import PropTypes from 'prop-types';
import axios from 'axios';
import * as Yup from 'yup';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';

const validationSchema = Yup.object().shape({
  minimumAmount: Yup.number().required('Minimum amount is required').min(0, 'Minimum amount must be positive'),
  maximumAmount: Yup.number()
    .required('Maximum amount is required')
    .min(Yup.ref('minimumAmount'), 'Maximum amount must be greater than to minimum amount')
});

const getInitialValues = () => {
  return {
    companyId: localStorage.getItem('companyId'),
    workflowType: [],
    accountNumber: [],
    minimumAmount: '',
    maximumAmount: ''
  };
};

const AddForm = ({ onClose, onSubmit }) => {
  const [groupOptions, setGroupOptions] = useState([]);
  const [succesMessage, setSuccesMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [companyId, setCompanyId] = useState('');

  useEffect(() => {
    const companyIdFromLocalStorage = localStorage.getItem('companyId');
    setCompanyId(companyIdFromLocalStorage);
  }, []);

  const handleSnackbarClose = () => {
    setSuccesMessage(null);
    setErrorMessage(null);
  };
  const handleClose = () => {
    onClose();
  };

  const formik = useFormik({
    validationSchema,
    initialValues: getInitialValues(),

    onSubmit: async (values) => {
      console.log('onSubmit called with values:', values);
      try {
        const workflowDTO = {
          companyId: localStorage.getItem('companyId'),
          maxAmount: parseFloat(values.maximumAmount),
          minAmount: parseFloat(values.minimumAmount),
          workFlowOptions: workflowLevels.map((option) => ({
            option: option.optionNumber,
            workFlowLevels: option.levels.map((level) => ({
              explan: level.authorizationLevel === 'Sequential With Next Level' ? 'S' : 'P',
              gravity: parseInt(level.noOfAuthorizers),
              groupName: level.group,
              level: level.level
            }))
          })),
          workflowAccounts: values.accountNumber.map((account) => ({
            accountNumber: account
          })),
          workflowRequestType: values.workflowType.map((wftype) => ({
            workflowType: wftype
          }))
        };
        const adminWfReq = {
          workflowDTO: [workflowDTO]
        };
        const baseUrl = process.env.REACT_APP_API_BASE_URL_WORKFLOW;
        const userId = localStorage.getItem('userId');
        await axios
          .post(`${baseUrl}/workflow2/workflow-config-admin/workflow`, adminWfReq, {
            headers: {
              adminUserId: userId,
              'request-id': 123456
            }
          })
          .then(function () {
            setSuccesMessage('Workflow Created Successfully');
            setErrorMessage(null);
            if (typeof onSubmit === 'function') {
              onSubmit();
              setTimeout(() => {
                onClose();
              }, 1500);
            }
          })
          .catch(function (error) {
            setErrorMessage(error.response.data.errorCode + ' - ' + error.response.data.returnMessage);
          });
      } catch (error) {
        setErrorMessage(error.response.data.errorCode + ' - ' + error.response.data.returnMessage);
      }
    }
  });

  const { errors, touched, getFieldProps } = formik;

  const [successMessage] = useState();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL_WORKFLOW;
        const userId = localStorage.getItem('userId');
        const response = await axios.get(`${baseUrl}/workflow2/group-config-admin/userGroup`, {
          headers: {
            adminUserId: userId,
            'request-id': 123
          }
        });

        const groupData = response.data.result;

        if (Array.isArray(groupData)) {
          setGroupOptions(groupData);
        } else {
          console.error('API response does not contain an array of groups:', groupData);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchGroups();
  }, []);

  const [workflowLevels, setWorkflowLevels] = useState([
    { optionNumber: 1, levels: [{ level: 1, group: '', noOfAuthorizers: '', authorizationLevel: '' }] }
  ]);

  const addWorkflowLevel = () => {
    setWorkflowLevels([
      ...workflowLevels,
      { optionNumber: workflowLevels.length + 1, levels: [{ level: 1, group: '', noOfAuthorizers: '', authorizationLevel: '' }] }
    ]);
  };

  const addAuthorizerOption = (optionIndex) => {
    const newWorkflowLevels = [...workflowLevels];
    const option = newWorkflowLevels[optionIndex];
    option.levels.push({
      level: ` ${option.levels.length + 1}`,
      group: '',
      noOfAuthorizers: '',
      authorizationLevel: ''
    });
    setWorkflowLevels(newWorkflowLevels);
  };

  const handleGroupChange = (e, optionIndex, levelIndex, newValue) => {
    const newWorkflowLevels = [...workflowLevels];
    newWorkflowLevels[optionIndex].levels[levelIndex].group = newValue?.groupId || '';
    setWorkflowLevels(newWorkflowLevels);
  };

  const handleAuthorizationLevelChange = (e, optionIndex, levelIndex, newValue) => {
    const newWorkflowLevels = [...workflowLevels];
    newWorkflowLevels[optionIndex].levels[levelIndex].authorizationLevel = newValue || '';

    if (newValue === 'Sequential With Next Level') {
      newWorkflowLevels[optionIndex].levels[levelIndex].explan = 'S';
    } else if (newValue === 'Parallel With Next Level') {
      newWorkflowLevels[optionIndex].levels[levelIndex].explan = 'P';
    } else {
      newWorkflowLevels[optionIndex].levels[levelIndex].explan = '';
    }

    setWorkflowLevels(newWorkflowLevels);
  };

  const handleNoOfAuthorizersChange = (e, optionIndex, levelIndex) => {
    const newWorkflowLevels = [...workflowLevels];
    newWorkflowLevels[optionIndex].levels[levelIndex].noOfAuthorizers = e.target.value;
    setWorkflowLevels(newWorkflowLevels);
  };

  const removeAuthorizerOption = (optionIndex, levelIndex) => {
    const newWorkflowLevels = [...workflowLevels];
    newWorkflowLevels[optionIndex].levels.splice(levelIndex, 1);
    setWorkflowLevels(newWorkflowLevels);
  };

  return (
    <>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={formik.handleSubmit}>
          <DialogTitle style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#616161' }}>Workflow Creation</DialogTitle>
          <Divider />
          <DialogContent sx={{}}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={12}>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Stack spacing={1.25}>
                      <Typography sx={{ color: 'black', fontWeight: 'bold' }}>Company ID</Typography>
                      <Typography>{companyId}</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />

          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={3}>
              <Grid item xs={3}>
                <Stack spacing={1.25}>
                  <InputLabel sx={{ color: 'black', fontWeight: 'bold' }} htmlFor="workflowType">
                    Workflow Type
                  </InputLabel>
                  <Select
                    fullWidth
                    id="workflowType"
                    {...getFieldProps('workflowType')}
                    onChange={(e) => {
                      formik.setFieldValue('workflowType', e.target.value);
                    }}
                    value={formik.values.workflowType}
                    error={Boolean(touched.workflowType && errors.workflowType)}
                    sx={{ width: '80%' }}
                    multiple
                  >
                    <MenuItem value="USER">USER</MenuItem>
                    <MenuItem value="OWN_TRANSFER">OWN_TRANSFER</MenuItem>
                    <MenuItem value="OTHER_SB">OTHER_SB</MenuItem>
                  </Select>
                </Stack>
              </Grid>

              <>
                <Grid item xs={3}>
                  <Stack spacing={1.25}>
                    <InputLabel sx={{ color: 'black', fontWeight: 'bold' }} htmlFor="accountNumber">
                      Accounts
                    </InputLabel>
                    <Select
                      fullWidth
                      id="accountNumber"
                      {...getFieldProps('accountNumber')}
                      value={formik.values.accountNumber}
                      onChange={(e) => {
                        formik.setFieldValue('accountNumber', e.target.value);
                      }}
                      error={Boolean(touched.accountNumber && errors.accountNumber)}
                      sx={{ width: '80%' }}
                      multiple
                    >
                      <MenuItem value="001910016519">001910016519</MenuItem>
                      <MenuItem value="022210000066">022210000066</MenuItem>
                      <MenuItem value="106257485695">106257485695</MenuItem>
                      <MenuItem value="106257485691">106257485691</MenuItem>
                      <MenuItem value="009210007900">009210007900</MenuItem>
                      <MenuItem value="100250022772">100250022772</MenuItem>
                      <MenuItem value="000150180503">000150180503</MenuItem>
                      <MenuItem value="106257485692">106257485692</MenuItem>
                    </Select>
                  </Stack>
                </Grid>
                <Grid item xs={3}>
                  <Stack spacing={1.25}>
                    <InputLabel sx={{ color: 'black', fontWeight: 'bold' }} htmlFor="minimumAmount">
                      Minimum Amount
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="minimumAmount"
                      type="text"
                      placeholder="Enter Minimum Amount"
                      {...getFieldProps('minimumAmount')}
                      value={formik.values.minimumAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      onChange={(e) => formik.setFieldValue('minimumAmount', e.target.value.replace(/,/g, ''))}
                      error={Boolean(touched.minimumAmount && errors.minimumAmount)}
                      sx={{ width: '90%' }}
                      helperText={touched.minimumAmount && errors.minimumAmount}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={3}>
                  <Stack spacing={1.25}>
                    <InputLabel sx={{ color: 'black', fontWeight: 'bold' }} htmlFor="maximumAmount">
                      Maximum Amount
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="maximumAmount"
                      type="text"
                      placeholder="Enter Maximum Amount"
                      {...getFieldProps('maximumAmount')}
                      value={formik.values.maximumAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      onChange={(e) => formik.setFieldValue('maximumAmount', e.target.value.replace(/,/g, ''))}
                      error={Boolean(touched.maximumAmount && errors.maximumAmount)}
                      sx={{ width: '90%' }}
                      helperText={touched.maximumAmount && errors.maximumAmount}
                    />
                  </Stack>
                </Grid>
              </>
            </Grid>
          </DialogContent>

          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0d47a1', marginBottom: '16px' }}
                >
                  Authorizer Options
                </Typography>

                {workflowLevels.map((option, optionIndex) => (
                  <div key={optionIndex}>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ backgroundColor: '#e0e0e0' }}>Option Number</TableCell>
                            <TableCell sx={{ backgroundColor: '#e0e0e0' }}>Level</TableCell>
                            <TableCell sx={{ backgroundColor: '#e0e0e0' }}>Group</TableCell>
                            <TableCell sx={{ backgroundColor: '#e0e0e0' }}>No of Authorizers</TableCell>
                            <TableCell sx={{ backgroundColor: '#e0e0e0' }}>Authorization Level</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {option.levels.map((level, index) => (
                            <TableRow key={index}>
                              <TableCell>{index === 0 ? option.optionNumber : ''}</TableCell>
                              <TableCell>{level.level}</TableCell>
                              <TableCell>
                                {/* <Select value={level.group} onChange={(e) => handleGroupChange(e, optionIndex, index)}>
                                  {groupOptions.map((group) => (
                                    <MenuItem key={group.groupId} value={group.groupId}>
                                      {group.groupName}
                                    </MenuItem>
                                  ))}
                                </Select> */}

                                <Autocomplete
                                  options={groupOptions}
                                  getOptionLabel={(option) => option?.groupId}
                                  value={groupOptions.find((option) => option.groupId === level.group) || null}
                                  disablePortal
                                  disableClearable
                                  onChange={(e, newValue) => handleGroupChange(e, optionIndex, index, newValue)}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Please Select GroupID"
                                      inputProps={{
                                        ...params.inputProps
                                      }}
                                    />
                                  )}
                                  style={{ width: '200px', maxHeight: '400px' }}
                                />
                              </TableCell>

                              <TableCell>
                                <TextField
                                  type="number"
                                  size="small"
                                  sx={{ width: '45px' }}
                                  value={level.noOfAuthorizers}
                                  onChange={(e) => handleNoOfAuthorizersChange(e, optionIndex, index)}
                                />
                              </TableCell>

                              <TableCell>
                                <Autocomplete
                                  options={['Sequential With Next Level', 'Parallel With Next Level']}
                                  value={level.authorizationLevel}
                                  onChange={(e, newValue) => handleAuthorizationLevelChange(e, optionIndex, index, newValue)}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Please Select Level"
                                      inputProps={{
                                        ...params.inputProps
                                      }}
                                    />
                                  )}
                                  style={{ width: '240px', maxHeight: '400px' }}
                                  disableClearable
                                />
                              </TableCell>

                              <TableCell>{/* Add your logic for Sequential/Parallel here */}</TableCell>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => addAuthorizerOption(optionIndex)}
                                sx={{
                                  backgroundColor: '#009688',
                                  fontWeight: 'bold',
                                  '&:hover': { backgroundColor: '#009688' },
                                  marginTop: '10px',
                                  marginLeft: '8px'
                                }}
                              >
                                Add Level
                              </Button>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => removeAuthorizerOption(optionIndex, index)}
                                sx={{
                                  backgroundColor: '#616161',
                                  fontWeight: 'bold',
                                  '&:hover': { backgroundColor: '#616161' },
                                  marginTop: '10px',
                                  marginLeft: '8px'
                                }}
                              >
                                Remove Level
                              </Button>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                ))}
              </Grid>
            </Grid>
            <Button
              variant="contained"
              color="primary"
              onClick={addWorkflowLevel}
              sx={{ backgroundColor: '#4caf50', fontWeight: 'bold', '&:hover': { backgroundColor: '#388e3c' } }}
            >
              Add Option
            </Button>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item></Grid>
              <Grid item>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    color="error"
                    onClick={handleClose}
                    sx={{
                      backgroundColor: '#f50057',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      '&:hover': { backgroundColor: '#f50057' }
                    }}
                  >
                    Close
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    //disabled={isSubmitting}
                    // onClick={() => {
                    //   console.log('Button Clicked');
                    //   formik.handleSubmit();
                    // }}
                    sx={{ backgroundColor: '#2979ff', fontWeight: 'bold', '&:hover': { backgroundColor: '#2979ff' } }}
                  >
                    Create Workflow
                  </Button>

                  {successMessage && <div>{successMessage}</div>}
                </Stack>
              </Grid>
            </Grid>
          </DialogActions>

          <Snackbar open={Boolean(succesMessage)} autoHideDuration={6000} onClose={handleSnackbarClose}>
            <MuiAlert elevation={6} variant="filled" severity="success">
              {succesMessage}
            </MuiAlert>
          </Snackbar>

          <Snackbar open={Boolean(errorMessage)} autoHideDuration={6000} onClose={handleSnackbarClose}>
            <MuiAlert elevation={6} variant="filled" severity="error">
              {errorMessage}
            </MuiAlert>
          </Snackbar>
        </Form>
      </FormikProvider>
    </>
  );
};

AddForm.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func
};

export default AddForm;
