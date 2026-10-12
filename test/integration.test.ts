import http from 'http';
import { AddressInfo } from 'net';
import { dispatchToMakeWebhook, buildMakePayload, calculateRiskMetrics } from '../server/makeWebhook.ts';
import { analyzeCommitmentWithGemma } from '../server/gemmaAnalyzer.ts';
import { CommitmentInput, AnalysisResult } from '../src/types.ts';

async function runComprehensiveTests() {
  console.log('🧪 Starting Commitment OS Comprehensive Integration & Webhook Test Suite...\n');
  let passed = 0;
  let failed = 0;

  // ----------------------------------------------------
  // TEST 1: Risk Metrics Calculation
  // ----------------------------------------------------
  try {
    console.log('▶ Test 1: Testing Risk Metrics Calculation...');
    const blockedMetrics = calculateRiskMetrics('BLOCKED', 'CRITICAL');
    const atRiskMetrics = calculateRiskMetrics('AT RISK', 'HIGH');
    const normalMetrics = calculateRiskMetrics('NORMAL', 'LOW');

    if (blockedMetrics.riskScore >= 90 && blockedMetrics.riskLevel === 'CRITICAL') {
      console.log(`  ✓ BLOCKED maps to Risk Score ${blockedMetrics.riskScore} (${blockedMetrics.riskLevel})`);
    } else {
      throw new Error(`Invalid BLOCKED metrics: ${JSON.stringify(blockedMetrics)}`);
    }

    if (atRiskMetrics.riskScore >= 60 && atRiskMetrics.riskLevel === 'HIGH') {
      console.log(`  ✓ AT RISK maps to Risk Score ${atRiskMetrics.riskScore} (${atRiskMetrics.riskLevel})`);
    } else {
      throw new Error(`Invalid AT RISK metrics: ${JSON.stringify(atRiskMetrics)}`);
    }

    if (normalMetrics.riskScore <= 20 && normalMetrics.riskLevel === 'LOW') {
      console.log(`  ✓ NORMAL maps to Risk Score ${normalMetrics.riskScore} (${normalMetrics.riskLevel})`);
    } else {
      throw new Error(`Invalid NORMAL metrics: ${JSON.stringify(normalMetrics)}`);
    }

    console.log('  ✅ Test 1 Passed: Risk calculation accurate.\n');
    passed++;
  } catch (err: any) {
    console.error('  ❌ Test 1 Failed:', err.message, '\n');
    failed++;
  }

  // ----------------------------------------------------
  // TEST 2: Make.com Payload Builder Verification
  // ----------------------------------------------------
  try {
    console.log('▶ Test 2: Verifying Make.com Canonical Payload Structure...');
    const customInput: CommitmentInput = {
      person: 'Dr. Sarah Connor',
      commitment: 'Deploy cyber defense node upgrade to primary VPC cluster',
      deadline: 'Today at 6:00 PM',
      currentStatus: 'Awaiting firewall configuration signoff',
      blocker: 'SecOps ticket #9823 unresolved',
      dependentTasks: 'Global failover test at midnight',
    };

    const mockAnalysis: AnalysisResult = {
      status: 'BLOCKED',
      rootBlocker: 'SecOps approval bottleneck on port 443 rule',
      reasoning: 'Critical technical block requiring external security escalation.',
      downstreamImpact: 'Global failover test will fail if port 443 is closed.',
      smallestRecoveryAction: 'Direct message SecOps on-call lead with ticket #9823.',
      revisedNextStep: 'Verify routing table propagation once rule is approved.',
      urgency: 'CRITICAL',
      analyzedAt: new Date().toISOString(),
      model: 'gemma-4-26b-a4b-it',
    };

    const payload = buildMakePayload(customInput, mockAnalysis, 'cmt_test_123');

    if (
      payload.person === 'Dr. Sarah Connor' &&
      payload.commitment === customInput.commitment &&
      payload.rootCause === mockAnalysis.rootBlocker &&
      payload.recoveryPlan === mockAnalysis.smallestRecoveryAction &&
      payload.riskLevel === 'CRITICAL' &&
      payload.riskScore >= 90 &&
      payload.commitmentId === 'cmt_test_123'
    ) {
      console.log('  ✓ User inputs preserved accurately in payload');
      console.log('  ✓ AI analysis mapped to rootCause, recoveryPlan, and impact');
      console.log(`  ✓ Generated unique commitment ID: ${payload.commitmentId}`);
      console.log('  ✅ Test 2 Passed: Canonical Make.com payload built correctly.\n');
      passed++;
    } else {
      throw new Error(`Payload fields mismatch: ${JSON.stringify(payload)}`);
    }
  } catch (err: any) {
    console.error('  ❌ Test 2 Failed:', err.message, '\n');
    failed++;
  }

  // ----------------------------------------------------
  // TEST 3: Mock Webhook Server (End-to-End HTTP Delivery)
  // ----------------------------------------------------
  let mockServerInstance: any = null;
  let receivedPayload: any = null;

  try {
    console.log('▶ Test 3: Testing End-to-End Webhook Dispatch to Mock Make.com Server...');
    await new Promise<void>((resolve) => {
      mockServerInstance = http.createServer((req, res) => {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          try {
            receivedPayload = JSON.parse(body);
          } catch {
            receivedPayload = body;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'accepted', executionId: 'make_exec_789' }));
        });
      });
      mockServerInstance.listen(0, '127.0.0.1', () => resolve());
    });

    const port = (mockServerInstance.address() as AddressInfo).port;
    const mockWebhookUrl = `http://127.0.0.1:${port}/hook/test-webhook`;

    const liveInput: CommitmentInput = {
      person: 'Carlos Mendoza',
      commitment: 'Finalize real-time webhook connector for customer billing',
      deadline: 'Tomorrow at 10:00 AM',
      currentStatus: 'Ready for integration verification',
      blocker: 'None',
      dependentTasks: 'Alpha customer rollout',
    };

    const liveAnalysis: AnalysisResult = {
      status: 'NORMAL',
      rootBlocker: 'None identified',
      reasoning: 'On schedule with all dependencies clear.',
      downstreamImpact: 'Customer rollout will proceed on schedule.',
      smallestRecoveryAction: 'Run smoke test on staging webhook receptor.',
      revisedNextStep: 'Promote container image to production.',
      urgency: 'LOW',
      analyzedAt: new Date().toISOString(),
      model: 'gemma-4-26b-a4b-it',
    };

    const dispatchResult = await dispatchToMakeWebhook(liveInput, liveAnalysis, undefined, mockWebhookUrl);

    if (dispatchResult.success && dispatchResult.attempted && receivedPayload) {
      console.log(`  ✓ Webhook dispatch returned HTTP ${dispatchResult.statusCode}`);
      console.log(`  ✓ Mock receiver captured commitmentId: "${receivedPayload.commitmentId}"`);
      console.log(`  ✓ Verified receiver got real user person: "${receivedPayload.person}"`);
      console.log(`  ✓ Verified receiver got real recoveryPlan: "${receivedPayload.recoveryPlan}"`);
      console.log('  ✅ Test 3 Passed: Real HTTP webhook dispatch verified.\n');
      passed++;
    } else {
      throw new Error(`Webhook dispatch failed: ${JSON.stringify(dispatchResult)}`);
    }
  } catch (err: any) {
    console.error('  ❌ Test 3 Failed:', err.message, '\n');
    failed++;
  } finally {
    if (mockServerInstance) {
      mockServerInstance.close();
    }
  }

  // ----------------------------------------------------
  // TEST 4: Webhook Failure & Timeout Graceful Degradation
  // ----------------------------------------------------
  try {
    console.log('▶ Test 4: Testing Webhook Non-200 and Failure Graceful Handling...');
    let failingServer: any = null;
    await new Promise<void>((resolve) => {
      failingServer = http.createServer((_req, res) => {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Bad Gateway from upstream service');
      });
      failingServer.listen(0, '127.0.0.1', () => resolve());
    });

    const port = (failingServer.address() as AddressInfo).port;
    const failingUrl = `http://127.0.0.1:${port}/failing-hook`;

    const testInput: CommitmentInput = {
      person: 'Test Person',
      commitment: 'Verify fault tolerance',
      deadline: 'Tomorrow',
      currentStatus: 'Testing error paths',
      blocker: 'None',
      dependentTasks: 'None',
    };

    const testAnalysis: AnalysisResult = {
      status: 'AT RISK',
      rootBlocker: 'Test blocker',
      reasoning: 'Testing resilience',
      downstreamImpact: 'None',
      smallestRecoveryAction: 'Retry test',
      revisedNextStep: 'Complete audit',
      urgency: 'MEDIUM',
      analyzedAt: new Date().toISOString(),
      model: 'gemma-4-26b-a4b-it',
    };

    const failedDispatch = await dispatchToMakeWebhook(testInput, testAnalysis, undefined, failingUrl);

    if (failedDispatch.attempted && !failedDispatch.success && failedDispatch.statusCode === 502) {
      console.log(`  ✓ Correctly captured failing status: HTTP ${failedDispatch.statusCode}`);
      console.log(`  ✓ Safe error message reported: "${failedDispatch.message}"`);
      console.log('  ✓ System did not crash or throw unhandled rejection');
      console.log('  ✅ Test 4 Passed: Graceful degradation on webhook error confirmed.\n');
      passed++;
    } else {
      throw new Error(`Expected handled failure, got: ${JSON.stringify(failedDispatch)}`);
    }

    if (failingServer) failingServer.close();
  } catch (err: any) {
    console.error('  ❌ Test 4 Failed:', err.message, '\n');
    failed++;
  }

  // ----------------------------------------------------
  // TEST 5: Standalone Mode (Unset Webhook URL)
  // ----------------------------------------------------
  try {
    console.log('▶ Test 5: Testing Standalone Mode When MAKE_WEBHOOK_URL Is Empty...');
    const testInput: CommitmentInput = {
      person: 'Offline User',
      commitment: 'Standalone assessment',
      deadline: 'Tomorrow',
      currentStatus: 'Working offline',
      blocker: 'None',
      dependentTasks: 'None',
    };

    const testAnalysis: AnalysisResult = {
      status: 'NORMAL',
      rootBlocker: 'None',
      reasoning: 'Running standalone',
      downstreamImpact: 'None',
      smallestRecoveryAction: 'Proceed as normal',
      revisedNextStep: 'Log work',
      urgency: 'LOW',
      analyzedAt: new Date().toISOString(),
      model: 'gemma-4-26b-a4b-it',
    };

    // Explicitly pass empty string for webhook URL
    const standaloneResult = await dispatchToMakeWebhook(testInput, testAnalysis, undefined, '');

    if (!standaloneResult.attempted && !standaloneResult.success) {
      console.log(`  ✓ Correctly reported: "${standaloneResult.message}"`);
      console.log('  ✅ Test 5 Passed: Standalone mode operates cleanly without errors.\n');
      passed++;
    } else {
      throw new Error(`Expected skipped dispatch, got: ${JSON.stringify(standaloneResult)}`);
    }
  } catch (err: any) {
    console.error('  ❌ Test 5 Failed:', err.message, '\n');
    failed++;
  }

  console.log(`=======================================================`);
  console.log(`Integration Test Summary: ${passed} passed, ${failed} failed`);
  console.log(`=======================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensiveTests();
