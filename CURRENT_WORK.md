# Current Work - LilLearner

## Active Task
Fix onboarding reset bug in SKIP_AUTH mode where navigating from categories → preferences screen resets app to start.

## Bug Analysis
**Root Cause**: `app/_layout.tsx:50`
- `onboardingDone` was defaulted to `true` instead of `false`
- This caused the AuthGuard to think onboarding was complete while waiting for AsyncStorage check
- When route segments changed during navigation, the guard condition `"!onboardingDone && !inOnboarding"` briefly evaluated to `false && false = true`, triggering redirect to onboarding start

## Change Made
- **File**: `app/_layout.tsx:50`
- Changed: `const [onboardingDone, setOnboardingDone] = useState(true);` (was `true`)
- To: `const [onboardingDone, setOnboardingDone] = useState(false);`

## Next Steps
1. Build debug APK to test fix
2. Push to main

## Context for Next Session
Onboarding flow should now properly allow navigation from categories → preferences without resetting.
