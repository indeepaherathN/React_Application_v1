// assets
import { BankOutlined, HourglassOutlined, SwapOutlined, AlertOutlined } from '@ant-design/icons';

// icons
const icons = { BankOutlined, HourglassOutlined, SwapOutlined, AlertOutlined };

// ==============================|| MENU ITEMS - PARAMETER ||============================== //

const parameter = {
  id: 'parameter',
  title: 'Parameter',
  type: 'group',
  children: [
    // {
    //   id: 'currency',
    //   title: 'Currency Crud Samples',
    //   type: 'item',
    //   url: '/parameter/currency-page',
    //   icon: icons.BankOutlined
    // },

    {
      id: 'workflow',
      title: 'Workflow Configuration',
      type: 'item',
      url: '/get-existing-pending-workflow',
      icon: icons.HourglassOutlined
    },
    // {
    //   id: 'paginationtest',
    //   title: 'Pagination API Test',
    //   type: 'item',
    //   url: '/parameter/get-pagiantion-api-test',
    //   icon: icons.AlertOutlined
    // },
    // {
    //   id: 'fundtransfer',
    //   title: 'Fund Transfer',
    //   type: 'item',
    //   url: '/parameter/get-fund-transfer',
    //   icon: icons.HourglassOutlined
    // },
    {
      id: 'fundtransfer',
      title: 'Fund Transfer',
      type: 'item',
      url: '/get-workflow-adapter',
      icon: icons.SwapOutlined
    },
    {
      id: 'fundtransferpending',
      title: 'Pending Approvals',
      type: 'item',
      url: '/get-pending-workflow-adapter',
      icon: icons.BankOutlined
    }

    // {
    //   id: 'usergroups',
    //   title: 'Existing Groups',
    //   type: 'item',
    //   url: '/parameter/get-user-groups',
    //   icon: icons.SwapOutlined
    // },
    // {
    //   id: 'branches',
    //   title: 'Branches',
    //   type: 'item',
    //   url: '/parameter/get-branches',
    //   icon: icons.AlertOutlined
    // }
  ]
};

export default parameter;
