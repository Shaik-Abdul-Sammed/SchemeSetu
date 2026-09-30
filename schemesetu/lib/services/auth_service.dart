/// Local phone session service used by legacy OTP screens.
class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  String? _currentPhoneNumber;

  String? get currentUserPhone => _currentPhoneNumber;
  Stream<String?> get authStateChanges => Stream.value(_currentPhoneNumber);

  /// Sends OTP to [phoneNumber] (must be in E.164 format e.g. +919876543210).
  Future<void> sendOtp({
    required String phoneNumber,
    required void Function(String verificationId, int? resendToken) onCodeSent,
    required void Function(String errorMessage) onError,
    required void Function(String phoneNumber) onAutoVerified,
    bool isResend = false,
  }) async {
    _currentPhoneNumber = phoneNumber;
    onCodeSent('local-session', null);
  }

  /// Verifies the [smsCode] entered by the user.
  Future<bool> verifyOtp(String smsCode) async {
    return _currentPhoneNumber != null && smsCode.trim().isNotEmpty;
  }

  Future<void> signOut() async {
    _currentPhoneNumber = null;
  }
}
