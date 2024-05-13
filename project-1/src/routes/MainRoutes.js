import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import MainLayout from 'layout/MainLayout';

// render - dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard')));

// render - application
//const SamplePage = Loadable(lazy(() => import('pages/application/SamplePage')));

// render - parameter
const CurrencyPage = Loadable(lazy(() => import('pages/parameter/currency/CurrencyPage')));
const AddExistingPendingWorkflow = Loadable(lazy(() => import('pages/parameter/existingpendingworkflow/AddExistingPendingWorkflow')));
//const ExistinggroupsoldPage = Loadable(lazy(() => import('pages/parameter/existinggroupsold/ExistinggroupsoldPage')));
const PaginationApiTestPage = Loadable(lazy(() => import('pages/parameter/paginationtest/PaginationApiTestPage')));
const AddUserGroup = Loadable(lazy(() => import('pages/parameter/usergroups/AddUserGroup')));
const Branches = Loadable(lazy(() => import('pages/parameter/brancheslist/Branches')));
//const FundTransfer = Loadable(lazy(() => import('pages/parameter/fundtransfer/fundtransferlist')));
const WorkflowAdapter = Loadable(lazy(() => import('pages/parameter/workflowadapter/workflowadapterlist')));
const WorkflowAdapterPending = Loadable(lazy(() => import('pages/parameter/workflowadapter/workflowadapterpending')));
// const AuthorizationLevelsPage = Loadable(lazy(() => import('pages/parameter/existinggroupsnew/AuthorizationLevelsPage')));
// const AddEditWorkflow = Loadable(lazy(() => import('pages/parameter/existinggroupsnew/AddEditWorkflow')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: 'dashoard',
      element: <DashboardDefault />
    },
    {
      path: 'get-existing-pending-workflow',
      element: <AddExistingPendingWorkflow />
    },
    {
      path: 'get-workflow-adapter',
      element: <WorkflowAdapter />
    },
    {
      path: 'get-pending-workflow-adapter',
      element: <WorkflowAdapterPending />
    },   
    // {
    //   path: 'application',
    //   children: [
    //     {
    //       path: 'sample-page',
    //       element: <SamplePage />
    //     }
    //   ]
    // },
    {
      path: 'parameter',
      children: [
        {
          path: 'currency-page',
          element: <CurrencyPage />
        },
        // {
        //   path: 'get_existing-groups-new',
        //   element: <Workflow />
        // },
        // {
        //   path: 'get_existing-groups-old',
        //   element: <ExistinggroupsoldPage />
        // },
        {
          path: 'get-pagiantion-api-test',
          element: <PaginationApiTestPage />
        },

        {
          path: 'get-user-groups',
          element: <AddUserGroup />
        },
        {
          path: 'get-branches',
          element: <Branches />
        }
      ]
    }
  ]
};

export default MainRoutes;
