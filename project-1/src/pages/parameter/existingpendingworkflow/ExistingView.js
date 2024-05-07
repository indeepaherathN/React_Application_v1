import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Grid, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const textFieldStyle = {
  fontWeight: 'bold',
  color: 'black'
};

const textFieldLabelStyle = {
  fontWeight: 'bold',
  color: '#1565c0'
};

const ApproverDetailsTable = ({ workflowSelectionId, onClose }) => {
  const [workflowDetails, setWorkflowDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [workflowOptions, setWorkflowOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(`${baseUrl}/workflow2/v3/v4/existing/client/${workflowSelectionId}/selectedWorkflow-details`);

        const approvedData = response.data;

        if (approvedData) {
          setWorkflowDetails({
            workflowType: approvedData.type,
            minAmount: approvedData.minAmount,
            maxAmount: approvedData.maxAmount,
            status: approvedData.status,
            approvalStatus: approvedData.approvalStatus
          });

          const transformedOptions = approvedData.workFlowOptions.flatMap((workFlowOption) => {
            const workFlowLevels = workFlowOption?.workFlowLevels || [];

            return workFlowLevels.map((item, index) => ({
              id: `${workFlowOption.workflowOptionId}_${index}`,
              option: workFlowOption.option,
              level: item.level || '',
              gravity: item.gravity || '',
              groupName: item.groupName || '',
              approvalStatus: approvedData.approvalStatus
            }));
          });

          setWorkflowOptions(transformedOptions);
        } else {
          setWorkflowDetails({});
          setWorkflowOptions([]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, [workflowSelectionId]);

  const handleClose = () => {
    onClose();
  };

  return (
    <div style={{ textAlign: 'left', padding: '16px' }}>
      <h2>Workflow Details</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error fetching data. Please try again later.</p>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Workflow Type"
              value={workflowDetails.workflowType || ''}
              InputProps={{
                readOnly: true,
                style: textFieldStyle
              }}
              InputLabelProps={{
                style: textFieldLabelStyle
              }}
            />
          </Grid>

          {/* <Grid item xs={6}>
            <TextField
              fullWidth
              label="Account"
              value={workflowDetails.account || ''}
              InputProps={{
                readOnly: true,
                style: textFieldStyle
              }}
              InputLabelProps={{
                style: textFieldLabelStyle
              }}
            />
          </Grid> */}

          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Minimum Amount"
              value={workflowDetails.minAmount || ''}
              InputProps={{
                readOnly: true,
                style: textFieldStyle
              }}
              InputLabelProps={{
                style: textFieldLabelStyle
              }}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Maximum Amount"
              value={workflowDetails.maxAmount || ''}
              InputProps={{
                readOnly: true,
                style: textFieldStyle
              }}
              InputLabelProps={{
                style: textFieldLabelStyle
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Status"
              value={workflowDetails.status || ''}
              InputProps={{
                readOnly: true,
                style: textFieldStyle
              }}
              InputLabelProps={{
                style: textFieldLabelStyle
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Approval Status"
              value={workflowDetails.approvalStatus || ''}
              InputProps={{
                readOnly: true,
                style: textFieldStyle
              }}
              InputLabelProps={{
                style: textFieldLabelStyle
              }}
            />
          </Grid>
        </Grid>
      )}

      <h3>Workflow Options</h3>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#bdbdbd', fontWeight: 'bold', width: '20%' }}>Option</TableCell>
              <TableCell sx={{ backgroundColor: '#bdbdbd', fontWeight: 'bold', width: '15%' }}>Level</TableCell>
              <TableCell sx={{ backgroundColor: '#bdbdbd', fontWeight: 'bold', width: '30%' }}>Group Name</TableCell>
              <TableCell sx={{ backgroundColor: '#bdbdbd', fontWeight: 'bold', width: '20%' }}>No of Authorizers</TableCell>
              <TableCell sx={{ backgroundColor: '#bdbdbd', fontWeight: 'bold', width: '15%' }}>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {workflowOptions.map((option) => (
              <TableRow key={option.id}>
                <TableCell>{option.option}</TableCell>
                <TableCell>{option.level}</TableCell>
                <TableCell>{option.groupName}</TableCell>
                <TableCell>{option.gravity}</TableCell>
                <TableCell>{option.approvalStatus}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div style={{ marginTop: '16px' }}>
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
      </div>
    </div>
  );
};

export default ApproverDetailsTable;
