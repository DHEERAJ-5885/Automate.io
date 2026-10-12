import { SampleCase } from '../types.ts';

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'normal',
    label: 'Normal (On Track)',
    statusType: 'NORMAL',
    description: 'Weekly marketing digest with high completion progress and no active blockers.',
    data: {
      person: 'Marcus Vance',
      commitment: 'Draft weekly marketing performance digest for leadership review',
      deadline: 'Friday 4:00 PM',
      currentStatus: 'On track, 75% complete with CAC and conversion metrics compiled',
      blocker: 'None',
      dependentTasks: 'Monday executive team review and growth allocation sync',
    },
  },
  {
    id: 'at-risk',
    label: 'At Risk (Threatened Deadline)',
    statusType: 'AT RISK',
    description: 'Payment integration facing edge-case tax calculation bugs with deadline in 36h.',
    data: {
      person: 'Elena Rostova',
      commitment: 'Ship Stripe payment elements upgrade for European merchant tier',
      deadline: 'Tomorrow at 12:00 PM',
      currentStatus: 'In progress, but staging build is failing 2 edge tests on VAT currency rounding',
      blocker: 'Ambiguity around Euro rounding rules in currency calculation spec',
      dependentTasks: 'EU Merchant invoices rollout, Q4 billing cycle cutover',
    },
  },
  {
    id: 'blocked',
    label: 'Blocked (External Bottleneck)',
    statusType: 'BLOCKED',
    description: 'Infrastructure task frozen for 4 days awaiting SecOps approval and IP ranges.',
    data: {
      person: 'Devon Chen',
      commitment: 'Provision cross-account VPC peering for warehouse analytics cluster',
      deadline: 'Today at 5:00 PM',
      currentStatus: 'Halted completely, cannot execute Terraform apply script',
      blocker: 'Awaiting SecOps IAM role approval and CIDR block allocation from cloud platform team for 4 days',
      dependentTasks: 'BigQuery pipeline cutover, customer compliance security audit sign-off',
    },
  },
];
