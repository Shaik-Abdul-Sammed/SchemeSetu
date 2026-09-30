class DecryptionException implements Exception {
  final String message;
  final dynamic cause;

  const DecryptionException(this.message, [this.cause]);

  @override
  String toString() =>
      'DecryptionException: $message${cause != null ? ' (Cause: $cause)' : ''}';
}

class EncryptionKeyException implements Exception {
  final String message;
  final dynamic cause;

  const EncryptionKeyException(this.message, [this.cause]);

  @override
  String toString() =>
      'EncryptionKeyException: $message${cause != null ? ' (Cause: $cause)' : ''}';
}
