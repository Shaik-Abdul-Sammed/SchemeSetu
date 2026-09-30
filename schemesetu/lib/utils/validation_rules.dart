/// Common validation rules for forms
class ValidationRules {
  /// Validate group name
  static String? validateGroupName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Group name is required';
    }
    if (value.trim().length < 3) {
      return 'Group name must be at least 3 characters';
    }
    if (value.trim().length > 50) {
      return 'Group name cannot exceed 50 characters';
    }
    return null;
  }

  /// Validate installment amount
  static String? validateInstallment(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Installment amount is required';
    }
    final amount = double.tryParse(value.trim());
    if (amount == null) {
      return 'Please enter a valid amount';
    }
    if (amount <= 0) {
      return 'Amount must be greater than zero';
    }
    if (amount > 999999) {
      return 'Amount is too large';
    }
    return null;
  }

  /// Validate total members count
  static String? validateMembersCount(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Total members count is required';
    }
    final count = int.tryParse(value.trim());
    if (count == null) {
      return 'Please enter a valid number';
    }
    if (count < 2) {
      return 'Group must have at least 2 members';
    }
    if (count > 100) {
      return 'Group cannot exceed 100 members';
    }
    return null;
  }

  /// Validate duration months
  static String? validateDuration(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Duration is required';
    }
    final months = int.tryParse(value.trim());
    if (months == null) {
      return 'Please enter a valid number';
    }
    if (months < 1) {
      return 'Duration must be at least 1 month';
    }
    if (months > 60) {
      return 'Duration cannot exceed 60 months';
    }
    return null;
  }

  /// Validate member name
  static String? validateMemberName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Member name is required';
    }
    if (value.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (value.trim().length > 50) {
      return 'Name cannot exceed 50 characters';
    }
    return null;
  }

  /// Validate mobile number
  static String? validateMobileNumber(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Mobile number is required';
    }
    final phone = value.trim().replaceAll(RegExp(r'[^\d]'), '');
    if (phone.length != 10) {
      return 'Mobile number must be 10 digits';
    }
    return null;
  }

  /// Validate bid amount
  static String? validateBidAmount(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Bid amount is required';
    }
    final amount = double.tryParse(value.trim());
    if (amount == null) {
      return 'Please enter a valid amount';
    }
    if (amount <= 0) {
      return 'Bid amount must be greater than zero';
    }
    return null;
  }
}
