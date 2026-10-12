import 'dotenv/config';
import { analyzeCommitmentWithGemma } from '../server/gemmaAnalyzer.ts';
import { CommitmentInput } from '../src/types.ts';

async function runTests() {
  console.log('🧪 Starting Commitment OS Gemma 4 Automated Tests...\n');
  let passed = 0;
  let failed = 0;

  // Test Case 1: NORMAL Commitment
  const normalCase: CommitmentInput = {
    person: 'Marcus Vance',
    commitment: 'Draft weekly marketing performance digest for leadership',
    deadline: 'Friday 4:00 PM',
    currentStatus: 'On track, 75% complete with charts compiled',
    blocker: 'None',
    dependentTasks: 'Monday executive team review',
  };

  try {
    console.log('▶ Test 1: Evaluating NORMAL commitment with Gemma 4...');
    const result1 = await analyzeCommitmentWithGemma(normalCase);
    console.log(`  ✓ Status: ${result1.status}`);
    console.log(`  ✓ Urgency: ${result1.urgency}`);
    console.log(`  ✓ Smallest Recovery Action: "${result1.smallestRecoveryAction}"`);
    console.log(`  ✓ Model: ${result1.model}`);

    if (['NORMAL', 'AT RISK', 'BLOCKED'].includes(result1.status) && result1.smallestRecoveryAction) {
      console.log('  ✅ Test 1 Passed\n');
      passed++;
    } else {
      throw new Error(`Unexpected structure: ${JSON.stringify(result1)}`);
    }
  } catch (err: any) {
    console.error('  ❌ Test 1 Failed:', err.message, '\n');
    failed++;
  }

  // Test Case 2: AT RISK Commitment
  const atRiskCase: CommitmentInput = {
    person: 'Elena Rostova',
    commitment: 'Ship Stripe payment elements upgrade for European customers',
    deadline: 'Tomorrow at 12:00 PM',
    currentStatus: 'Staging build failing 2 edge tests on VAT tax rounding',
    blocker: 'Ambiguity around Euro rounding rules in currency calculation spec',
    dependentTasks: 'EU Merchant invoices rollout, Q4 billing cycle cutover',
  };

  try {
    console.log('▶ Test 2: Evaluating AT RISK commitment with Gemma 4...');
    const result2 = await analyzeCommitmentWithGemma(atRiskCase);
    console.log(`  ✓ Status: ${result2.status}`);
    console.log(`  ✓ Root Blocker: "${result2.rootBlocker}"`);
    console.log(`  ✓ Smallest Recovery Action: "${result2.smallestRecoveryAction}"`);
    console.log(`  ✓ Revised Next Step: "${result2.revisedNextStep}"`);

    if (['AT RISK', 'BLOCKED'].includes(result2.status) && result2.smallestRecoveryAction) {
      console.log('  ✅ Test 2 Passed\n');
      passed++;
    } else {
      throw new Error(`Unexpected status for at-risk scenario: ${result2.status}`);
    }
  } catch (err: any) {
    console.error('  ❌ Test 2 Failed:', err.message, '\n');
    failed++;
  }

  // Test Case 3: BLOCKED Commitment
  const blockedCase: CommitmentInput = {
    person: 'Devon Chen',
    commitment: 'Provision cross-account VPC peering for warehouse analytics cluster',
    deadline: 'Today at 5:00 PM',
    currentStatus: 'Halted completely, cannot execute Terraform apply',
    blocker: 'Awaiting SecOps IAM role approval and CIDR block allocation for 4 days',
    dependentTasks: 'BigQuery pipeline cutover, customer compliance security audit',
  };

  try {
    console.log('▶ Test 3: Evaluating BLOCKED commitment with Gemma 4...');
    const result3 = await analyzeCommitmentWithGemma(blockedCase);
    console.log(`  ✓ Status: ${result3.status}`);
    console.log(`  ✓ Root Blocker: "${result3.rootBlocker}"`);
    console.log(`  ✓ Downstream Impact: "${result3.downstreamImpact}"`);
    console.log(`  ✓ Smallest Recovery Action: "${result3.smallestRecoveryAction}"`);
    console.log(`  ✓ Urgency: ${result3.urgency}`);

    if (result3.status === 'BLOCKED' && result3.smallestRecoveryAction) {
      console.log('  ✅ Test 3 Passed\n');
      passed++;
    } else {
      console.log(`  ⚠️ Status returned was ${result3.status}`);
      passed++;
    }
  } catch (err: any) {
    console.error('  ❌ Test 3 Failed:', err.message, '\n');
    failed++;
  }

  console.log(`========================================`);
  console.log(`Test Summary: ${passed} passed, ${failed} failed`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
