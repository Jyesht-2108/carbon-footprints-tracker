"""
Test script to manually trigger notifications for testing.
Run this while the frontend is open to see popup notifications.
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'plugins', 'orchestration-engine'))

from src.services.websocket_manager import ws_manager
from datetime import datetime


async def test_alert_notification():
    """Test alert notification."""
    print("🚨 Sending test alert notification...")
    
    alert = {
        'id': 999,
        'level': 'critical',
        'message': 'TEST ALERT: This is a test critical alert notification',
        'hotspot_id': 1,
        'created_at': datetime.utcnow().isoformat()
    }
    
    await ws_manager.emit_alert(alert)
    print("✅ Alert notification sent!")


async def test_hotspot_notification():
    """Test hotspot notification."""
    print("🔥 Sending test hotspot notification...")
    
    hotspot = {
        'id': 999,
        'entity': 'TEST_SUPPLIER',
        'severity': 'critical',
        'predicted_co2': 95.5,
        'baseline_co2': 60.0,
        'percent_above': 59.2,
        'created_at': datetime.utcnow().isoformat()
    }
    
    await ws_manager.emit_hotspot(hotspot)
    print("✅ Hotspot notification sent!")


async def test_multiple_notifications():
    """Test multiple notifications in sequence."""
    print("\n📢 Testing multiple notifications...\n")
    
    # Test 1: Info alert
    await ws_manager.emit_alert({
        'id': 1001,
        'level': 'info',
        'message': 'TEST: System baseline recalculation completed',
        'created_at': datetime.utcnow().isoformat()
    })
    print("✅ Info alert sent")
    await asyncio.sleep(2)
    
    # Test 2: Warning alert
    await ws_manager.emit_alert({
        'id': 1002,
        'level': 'warn',
        'message': 'TEST: Emissions approaching threshold',
        'created_at': datetime.utcnow().isoformat()
    })
    print("✅ Warning alert sent")
    await asyncio.sleep(2)
    
    # Test 3: Critical alert
    await ws_manager.emit_alert({
        'id': 1003,
        'level': 'critical',
        'message': 'TEST: Critical emissions spike detected!',
        'created_at': datetime.utcnow().isoformat()
    })
    print("✅ Critical alert sent")
    await asyncio.sleep(2)
    
    # Test 4: Hotspot
    await ws_manager.emit_hotspot({
        'id': 1004,
        'entity': 'Heavy_Load_Supplier',
        'severity': 'critical',
        'predicted_co2': 88.7,
        'baseline_co2': 60.0,
        'percent_above': 47.9,
        'created_at': datetime.utcnow().isoformat()
    })
    print("✅ Hotspot notification sent")
    
    print("\n✅ All test notifications sent!")
    print("📊 Check your browser - you should see 4 popup notifications")
    print("🔔 The notification bell should show badge with count: 4")


async def main():
    """Main test function."""
    print("=" * 60)
    print("🧪 NOTIFICATION SYSTEM TEST")
    print("=" * 60)
    print("\n⚠️  IMPORTANT: Make sure the frontend is running and open in browser!")
    print("⚠️  Make sure the orchestration engine is running!")
    print("\nPress Enter to start test...")
    input()
    
    print("\nChoose test:")
    print("1. Test single alert notification")
    print("2. Test single hotspot notification")
    print("3. Test multiple notifications (recommended)")
    print("4. Exit")
    
    choice = input("\nEnter choice (1-4): ").strip()
    
    if choice == '1':
        await test_alert_notification()
    elif choice == '2':
        await test_hotspot_notification()
    elif choice == '3':
        await test_multiple_notifications()
    elif choice == '4':
        print("👋 Exiting...")
        return
    else:
        print("❌ Invalid choice")
        return
    
    print("\n" + "=" * 60)
    print("✅ TEST COMPLETE")
    print("=" * 60)
    print("\n📝 What to check:")
    print("  1. Popup notifications appeared in top-right corner")
    print("  2. Notification bell has red badge with count")
    print("  3. Bell icon turned yellow")
    print("  4. Clicking bell navigates to /alerts page")
    print("  5. Badge clears after clicking bell")
    print("\n")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n👋 Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
