import React, { useState, useEffect, Fragment } from 'react';
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
  ListSubheader,
  FormHelperText,
  Paper
} from '@mui/material';

import { Form, FormikProvider, useFormik } from 'formik';
import PropTypes from 'prop-types';
import axios from 'axios';
import * as Yup from 'yup';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';

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
    { optionNumber: 1, levels: [{ group: '', noOfAuthorizers: '', authorizationLevel: '' }] }
  ]);

  const addWorkflowLevel = () => {
    setWorkflowLevels([
      ...workflowLevels,
      { optionNumber: workflowLevels.length + 1, levels: [{ group: '', noOfAuthorizers: '', authorizationLevel: '' }] }
    ]);
  };

  const addAuthorizerOption = (optionIndex) => {
    const newWorkflowLevels = [...workflowLevels];
    const option = newWorkflowLevels[optionIndex];
    option.levels.push({
      group: '',
      noOfAuthorizers: '',
      authorizationLevel: ''
    });
    console.log(newWorkflowLevels);
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
    const curretLevels = workflowLevels[optionIndex].levels.length;
    if (curretLevels === 1) return;
    const newWorkflowLevels = [...workflowLevels];
    newWorkflowLevels[optionIndex].levels.splice(levelIndex, 1);
    setWorkflowLevels(newWorkflowLevels);
  };

  const removeAuthorizerWorkflow = (optionIndex) => {
    const curretWorkflows = workflowLevels.length;
    if (curretWorkflows === 1) return;
    const newWorkflowLevels = [...workflowLevels];
    newWorkflowLevels.splice(optionIndex, 1);
    setWorkflowLevels(newWorkflowLevels);
  };

  return (
    <>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={formik.handleSubmit}>
          <DialogTitle style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#616161' }}>Workflow Creation</DialogTitle>
          <Divider />
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Grid item xs={6} paddingLeft={4}>
                  <Stack spacing={1.25}>
                    <Typography sx={{ color: 'black', fontWeight: 'bold', fontSize: '15px' }}>Company ID</Typography>
                    <Typography>{companyId}</Typography>
                  </Stack>
                </Grid>
              </Grid>
              <Grid item xs={12} md={4} paddingRight={4}>
                <Stack spacing={1.25}>
                  <InputLabel sx={{ color: 'black', fontWeight: 'bold' }} htmlFor="workflowType">
                    Workflow Type
                  </InputLabel>
                  <FormControl error={Boolean(formik.touched.workflowType && formik.errors.workflowType)}>
                    <Select
                      fullWidth
                      id="workflowType"
                      multiple
                      value={formik.values.workflowType}
                      onChange={(e) => formik.setFieldValue('workflowType', e.target.value)}
                      renderValue={(selected) => selected.join(',')}
                    >
                      <ListSubheader>Category A</ListSubheader>
                      <MenuItem key="WORKFLOW_CONFIG" value="WORKFLOW_CONFIG">
                        <Checkbox checked={formik.values.workflowType.includes('WORKFLOW_CONFIG')} />
                        <ListItemText primary="WORKFLOW_CONFIG" />
                      </MenuItem>
                      <MenuItem key="PAYEE_TEMPLATE" value="PAYEE_TEMPLATE">
                        <Checkbox checked={formik.values.workflowType.includes('PAYEE_TEMPLATE')} />
                        <ListItemText primary="PAYEE_TEMPLATE" />
                      </MenuItem>
                      <MenuItem key="CM_BRANCH" value="CM_BRANCH">
                        <Checkbox checked={formik.values.workflowType.includes('CM_BRANCH')} />
                        <ListItemText primary="CM_BRANCH" />
                      </MenuItem>

                      <ListSubheader>Category B</ListSubheader>
                      <MenuItem key="OTHER_SB" value="OTHER_SB">
                        <Checkbox checked={formik.values.workflowType.includes('OTHER_SB')} />
                        <ListItemText primary="OTHER_SB" />
                      </MenuItem>
                      <MenuItem key="OWN_TRANSFER" value="OWN_TRANSFER">
                        <Checkbox checked={formik.values.workflowType.includes('OWN_TRANSFER')} />
                        <ListItemText primary="OWN_TRANSFER" />
                      </MenuItem>
                      <MenuItem key="OTHER_NON_SB" value="OTHER_NON_SB">
                        <Checkbox checked={formik.values.workflowType.includes('OTHER_NON_SB')} />
                        <ListItemText primary="OTHER_NON_SB" />
                      </MenuItem>

                      <ListSubheader>Category C</ListSubheader>
                      <MenuItem key="MOBILE_CASH" value="MOBILE_CASH">
                        <Checkbox checked={formik.values.workflowType.includes('MOBILE_CASH')} />
                        <ListItemText primary="MOBILE_CASH" />
                      </MenuItem>
                      <MenuItem key="PAY_BULK" value="PAY_BULK">
                        <Checkbox checked={formik.values.workflowType.includes('PAY_BULK')} />
                        <ListItemText primary="PAY_BULK" />
                      </MenuItem>
                      <MenuItem key="BULK_TRANSFER" value="BULK_TRANSFER">
                        <Checkbox checked={formik.values.workflowType.includes('BULK_TRANSFER')} />
                        <ListItemText primary="BULK_TRANSFER" />
                      </MenuItem>
                    </Select>

                    {formik.touched.workflowType && formik.errors.workflowType && (
                      <FormHelperText>{formik.errors.workflowType}</FormHelperText>
                    )}
                  </FormControl>
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />

          <DialogContent>
            <Grid container paddingLeft={4}>
              <Grid item md={4} xs={12}>
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
              <Grid item md={4} xs={12}>
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
              <Grid item md={4} xs={12}>
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
            </Grid>
          </DialogContent>

          <DialogContent>
            <Grid container paddingLeft={4} paddingRight={4}>
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0d47a1', marginBottom: '16px' }}
                >
                  Authorizer Options
                </Typography>

                {workflowLevels.map((option, optionIndex) => (
                  <Fragment key={optionIndex}>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ backgroundColor: '#e0e0e0' }}>Option Number</TableCell>
                            <TableCell sx={{ backgroundColor: '#e0e0e0' }}>Level</TableCell>
                            <TableCell sx={{ backgroundColor: '#e0e0e0' }}>Group</TableCell>
                            <TableCell sx={{ backgroundColor: '#e0e0e0' }}>No of Authorizers</TableCell>
                            <TableCell sx={{ backgroundColor: '#e0e0e0' }}>Authorization Level</TableCell>
                            <TableCell sx={{ backgroundColor: '#e0e0e0' }}> </TableCell>
                            <TableCell sx={{ backgroundColor: '#e0e0e0' }}> </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {option.levels.map((level, index) => (
                            <TableRow key={index}>
                              <TableCell>{index === 0 ? optionIndex + 1 : ''}</TableCell>
                              <TableCell>{index + 1}</TableCell>
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
                    <Grid item xs={12} paddingTop={2} paddingBottom={2} >
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => removeAuthorizerWorkflow(optionIndex)}
                        sx={{
                          fontWeight: 'bold',
                          '&:hover': { backgroundColor: '#ef9a9a' },
                          marginTop: '10px',
                          marginLeft: '8px',
                          float: 'right'
                        }}
                      >
                        Remove Option
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => addAuthorizerOption(optionIndex)}
                        sx={{
                          backgroundColor: '#009688',
                          fontWeight: 'bold',
                          '&:hover': { backgroundColor: '#009688' },
                          marginTop: '10px',
                          marginLeft: '8px',
                          float: 'right'
                        }}
                      >
                        Add Level
                      </Button>
                    </Grid>
                    <Grid item xs={12} paddingTop={2} paddingBottom={2} >
                      <br />
                      <Divider />
                      <br />
                    </Grid>
                  </Fragment>
                ))}
              </Grid>
            </Grid>

            <Grid container paddingLeft={4} paddingTop={2}>
              <Grid item xs={6} md={3} sx={{ p: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={addWorkflowLevel}
                  sx={{ backgroundColor: '#4caf50', fontWeight: 'bold', '&:hover': { backgroundColor: '#388e3c' } }}
                >
                  Add Option
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
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
