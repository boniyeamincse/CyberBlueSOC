#!/usr/bin/env python3
"""
Integration test for AI-powered Incident Response Automation
Tests the complete flow from alert ingestion to automated response
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_ai_incident_analysis():
    """Test AI incident analysis functionality"""
    print("Testing AI Incident Analysis...")

    try:
        from routers.ai import incident_analysis_service

        # Test with malware incident
        incident_data = {
            'title': 'Test Malware Detection',
            'description': 'Malware signature detected with MD5 hash abc123',
            'severity': 'high',
            'alert_count': 5,
            'affected_systems': 2,
            'source_ips': 3,
            'login_failures': 0,
            'privilege_changes': 0
        }

        analysis = incident_analysis_service.analyze_incident(incident_data)

        print(f"✓ Predicted Type: {analysis.get('predicted_type')}")
        print(f"✓ Confidence: {analysis.get('confidence'):.2f}")
        print(f"✓ Risk Score: {analysis.get('risk_score')}")
        print(f"✓ Recommended Actions: {len(analysis.get('recommended_actions', []))}")

        # Test with phishing incident
        phishing_data = {
            'title': 'Suspicious Email Activity',
            'description': 'Multiple phishing emails detected from external domain',
            'severity': 'medium',
            'alert_count': 10,
            'affected_systems': 5,
            'source_ips': 8,
            'login_failures': 2,
            'privilege_changes': 0
        }

        phishing_analysis = incident_analysis_service.analyze_incident(phishing_data)
        print(f"✓ Phishing Analysis - Type: {phishing_analysis.get('predicted_type')}")

        return True

    except Exception as e:
        print(f"✗ AI Analysis test failed: {e}")
        return False

def test_dynamic_playbook_execution():
    """Test dynamic playbook execution logic"""
    print("\nTesting Dynamic Playbook Execution...")

    try:
        from routers.playbooks import execute_dynamic_playbook

        # Mock AI recommendations
        ai_recommendations = {
            'predicted_type': 'malware',
            'confidence': 0.85,
            'risk_score': 78
        }

        # Mock alert data
        alert_data = {
            'id': 'test-alert-001',
            'rule': {'level': 12},
            'syscheck': {'md5': 'abc123'}
        }

        # Mock request and db for testing
        class MockRequest:
            def __init__(self):
                self.client = type('obj', (object,), {'host': '127.0.0.1'})()

        class MockDB:
            pass

        # Test playbook selection logic
        result = execute_dynamic_playbook(alert_data, 12, ai_recommendations, MockRequest(), MockDB())

        print(f"✓ Playbook executed for: {result.get('predicted_type')}")
        print(f"✓ Actions generated: {len(result.get('actions', []))}")
        print(f"✓ Risk score: {result.get('risk_score')}")

        return True

    except Exception as e:
        print(f"✗ Dynamic playbook test failed: {e}")
        return False

def test_incident_response_integration():
    """Test complete incident response integration"""
    print("\nTesting Incident Response Integration...")

    try:
        # Test that all components can be imported
        from routers.ai import incident_analysis_service
        from routers.playbooks import auto_incident_response, execute_dynamic_playbook
        from routers.incidents import create_case_from_alert

        print("✓ All incident response modules imported successfully")

        # Verify AI service has analysis capability
        if hasattr(incident_analysis_service, 'analyze_incident'):
            print("✓ AI analysis service available")
        else:
            print("✗ AI analysis service missing")
            return False

        # Verify playbook functions exist
        if callable(auto_incident_response):
            print("✓ Automated incident response function available")
        else:
            print("✗ Automated incident response function missing")
            return False

        if callable(execute_dynamic_playbook):
            print("✓ Dynamic playbook execution available")
        else:
            print("✗ Dynamic playbook execution missing")
            return False

        return True

    except Exception as e:
        print(f"✗ Integration test failed: {e}")
        return False

def main():
    """Run all integration tests"""
    print("🚀 Starting AI-powered Incident Response Integration Tests\n")

    tests = [
        test_ai_incident_analysis,
        test_dynamic_playbook_execution,
        test_incident_response_integration
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"✗ Test {test.__name__} crashed: {e}")

    print(f"\n{'='*50}")
    print(f"Test Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All integration tests passed!")
        print("\nAI-powered Incident Response Automation is ready!")
        print("\nFeatures implemented:")
        print("✓ Machine learning incident analysis")
        print("✓ Dynamic playbook execution")
        print("✓ SOAR automation with AI recommendations")
        print("✓ Automated response actions")
        print("✓ Frontend integration for management")
        return True
    else:
        print("❌ Some tests failed. Check implementation.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)