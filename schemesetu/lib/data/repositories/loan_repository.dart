import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:drift/drift.dart';
import '../local/app_database.dart';
import '../local/shg_dao.dart';
import '../../providers/shg_providers.dart';
import '../../services/encryption_service.dart';

part 'loan_repository.g.dart';

abstract class ILoanRepository {
  Future<List<SHGLoan>> getLoansByMembershipId(int membershipId);
  Future<int> insertLoan(SHGLoansCompanion loan);
  Future<List<SHGLoanRepayment>> getRepaymentsByLoanId(int loanId);
  Future<int> insertRepayment(SHGLoanRepaymentsCompanion repayment);
}

class LoanRepository implements ILoanRepository {
  final SHGDao _shgDao;
  final EncryptionService _encryptionService = EncryptionService();

  LoanRepository(this._shgDao);

  @override
  Future<List<SHGLoan>> getLoansByMembershipId(int membershipId) async {
    final rawLoans = await _shgDao.getLoansByMembershipId(membershipId);
    return rawLoans.map((loan) {
      return loan.copyWith(
        principalAmount: _encryptionService.decrypt(loan.principalAmount),
        interestRate: _encryptionService.decrypt(loan.interestRate),
        purpose: Value(loan.purpose != null
            ? _encryptionService.decrypt(loan.purpose!)
            : null),
      );
    }).toList();
  }

  @override
  Future<int> insertLoan(SHGLoansCompanion loan) {
    final encryptedLoan = loan.copyWith(
      principalAmount:
          Value(_encryptionService.encrypt(loan.principalAmount.value)),
      interestRate: Value(_encryptionService.encrypt(loan.interestRate.value)),
      purpose: loan.purpose.present
          ? Value(loan.purpose.value != null
              ? _encryptionService.encrypt(loan.purpose.value!)
              : null)
          : const Value.absent(),
    );
    return _shgDao.insertLoan(encryptedLoan);
  }

  @override
  Future<List<SHGLoanRepayment>> getRepaymentsByLoanId(int loanId) async {
    final rawRepayments = await _shgDao.getRepaymentsByLoanId(loanId);
    return rawRepayments.map((rep) {
      return rep.copyWith(
        principalPaid: _encryptionService.decrypt(rep.principalPaid),
        interestPaid: _encryptionService.decrypt(rep.interestPaid),
      );
    }).toList();
  }

  @override
  Future<int> insertRepayment(SHGLoanRepaymentsCompanion repayment) {
    final encryptedRepayment = repayment.copyWith(
      principalPaid:
          Value(_encryptionService.encrypt(repayment.principalPaid.value)),
      interestPaid:
          Value(_encryptionService.encrypt(repayment.interestPaid.value)),
    );
    return _shgDao.insertRepayment(encryptedRepayment);
  }
}

@riverpod
ILoanRepository loanRepository(Ref ref) {
  final dao = ref.watch(shgDaoProvider);
  return LoanRepository(dao);
}
