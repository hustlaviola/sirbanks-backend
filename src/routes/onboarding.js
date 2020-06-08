import express from 'express';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';
import OnboardingController from '../controllers/Onboarding';
import OnboardingMiddleware from '../middlewares/Onboarding';

const router = express.Router();

router.post('/phone_verification',
    validator('phone_verification'),
    validate,
    OnboardingController.phoneVerification);

router.post('/phone_verification_check/:role',
    validator('phone_verification_check'),
    validate,
    OnboardingController.phoneVerificationCheck);

router.post('/personal_details',
    validator('personal_details'),
    validate,
    OnboardingMiddleware.validateOnboarding,
    OnboardingController.updatePersonalDetails);

router.post('/resend_email_verification',
    validator('email_only'),
    validate,
    OnboardingMiddleware.validateResendEmailLink,
    OnboardingController.resendEmailVerification);

export default router;
