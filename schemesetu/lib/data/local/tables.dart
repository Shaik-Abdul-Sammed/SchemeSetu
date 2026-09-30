import 'package:drift/drift.dart';

@DataClassName('Member')
@TableIndex(name: 'idx_member_phone', columns: {#phone})
class Members extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text()();
  TextColumn get phone => text().withLength(min: 10, max: 15)();
  TextColumn get whatsapp => text().nullable()();
  TextColumn get address => text().nullable()();
  TextColumn get occupation => text().nullable()();
  DateTimeColumn get joiningDate =>
      dateTime().withDefault(currentDateAndTime)();
  TextColumn get status => text().withDefault(const Constant('Active'))();
  TextColumn get photoPath => text().nullable()();
  RealColumn get trustScore => real().nullable()();
  TextColumn get pin => text().nullable()();
}

@DataClassName('Group')
class Groups extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text()();
  RealColumn get chitValue => real()();
  IntColumn get totalMonths => integer()();
  RealColumn get monthlyContribution => real()();
  DateTimeColumn get startDate => dateTime()();
  TextColumn get status => text().withDefault(const Constant('Active'))();
  TextColumn get whatsappGroupLink => text().nullable()();
  BoolColumn get isDeleted => boolean().withDefault(const Constant(false))();
  // Day of month (1-31) when payment is due, defaults to 15
  IntColumn get paymentDueDate => integer().withDefault(const Constant(15))();
}

@DataClassName('Membership')
class Memberships extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get memberId =>
      integer().references(Members, #id, onDelete: KeyAction.cascade)();
  IntColumn get groupId =>
      integer().references(Groups, #id, onDelete: KeyAction.cascade)();
  RealColumn get installmentsCount => real().withDefault(const Constant(1.0))();
  DateTimeColumn get joinedAt => dateTime().withDefault(currentDateAndTime)();
}

@DataClassName('Round')
class Rounds extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get groupId =>
      integer().references(Groups, #id, onDelete: KeyAction.cascade)();
  IntColumn get roundNumber => integer()();
  IntColumn get month => integer()();
  IntColumn get year => integer()();
  RealColumn get bidAmount => real().nullable()();
  IntColumn get winnerMemberId => integer()
      .nullable()
      .references(Members, #id, onDelete: KeyAction.setNull)();
  RealColumn get foremanCommission => real().nullable()();
  RealColumn get dividendDistributed => real().nullable()();
  TextColumn get payoutStatus =>
      text().withDefault(const Constant('Pending'))(); // Pending, Released
  DateTimeColumn get payoutDate => dateTime().nullable()();
  TextColumn get guarantor1Name => text().nullable()();
  TextColumn get guarantor1Phone => text().nullable()();
  TextColumn get guarantor2Name => text().nullable()();
  TextColumn get guarantor2Phone => text().nullable()();
  IntColumn get guarantorMemberId => integer()
      .nullable()
      .references(Members, #id, onDelete: KeyAction.setNull)();
  RealColumn get winnerPaid => real().nullable()();
  RealColumn get winnerBalance => real().nullable()();
  RealColumn get winnerLeft => real().nullable()();
  TextColumn get winnerPaymentMode => text().nullable()();
  TextColumn get winnerRemarks => text().nullable()();
  TextColumn get hijriDate => text().nullable()();
  IntColumn get exchangedToMemberId => integer()
      .nullable()
      .references(Members, #id, onDelete: KeyAction.setNull)();
  TextColumn get exchangeNote => text().nullable()();
}

@DataClassName('Payment')
@TableIndex(name: 'idx_payment_round', columns: {#roundId})
class Payments extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get membershipId =>
      integer().references(Memberships, #id, onDelete: KeyAction.cascade)();
  IntColumn get roundId =>
      integer().references(Rounds, #id, onDelete: KeyAction.cascade)();
  RealColumn get amount => real()();
  DateTimeColumn get paymentDate =>
      dateTime().withDefault(currentDateAndTime)();
  TextColumn get paymentMode => text()(); // Cash, UPI, Bank, etc.
  TextColumn get status => text().withDefault(const Constant('Completed'))();
  TextColumn get remarks => text().nullable()();
  TextColumn get collector => text().nullable()();
  TextColumn get transactionId => text().nullable()();
  TextColumn get receiptPhotoPath => text().nullable()();
  TextColumn get collectorName => text().nullable()();
}

@DataClassName('AdminSetting')
class AdminSettings extends Table {
  TextColumn get key => text()();
  TextColumn get value => text()();

  @override
  Set<Column> get primaryKey => {key};
}

@DataClassName('AuditLog')
class AuditLogs extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get action =>
      text()(); // e.g. "Deleted Group", "Added Member", "Updated Payment"
  TextColumn get targetName => text()(); // e.g. "Group A", "John Doe"
  TextColumn get details => text().nullable()();
  DateTimeColumn get timestamp => dateTime().withDefault(currentDateAndTime)();
}

@DataClassName('SHGGroup')
class SHGGroups extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text()();
  DateTimeColumn get formationDate =>
      dateTime().withDefault(currentDateAndTime)();
  RealColumn get monthlySavingAmount =>
      real().withDefault(const Constant(0.0))();
  TextColumn get bankAccountNumber => text().nullable()();
  TextColumn get ifscCode => text().nullable()();
  TextColumn get bankName => text().nullable()();
  TextColumn get status => text().withDefault(const Constant('Active'))();
}

@DataClassName('SHGMembership')
class SHGMemberships extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get memberId =>
      integer().references(Members, #id, onDelete: KeyAction.cascade)();
  IntColumn get groupId =>
      integer().references(SHGGroups, #id, onDelete: KeyAction.cascade)();
  DateTimeColumn get joinedAt => dateTime().withDefault(currentDateAndTime)();
  TextColumn get role => text()
      .withDefault(const Constant('Member'))(); // Member, President, Secretary
}

@DataClassName('SHGMeeting')
class SHGMeetings extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get groupId =>
      integer().references(SHGGroups, #id, onDelete: KeyAction.cascade)();
  DateTimeColumn get meetingDate => dateTime()();
  TextColumn get resolutionNote => text().nullable()();
  TextColumn get conductedBy => text().nullable()();
}

@DataClassName('SHGSaving')
class SHGSavings extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get membershipId =>
      integer().references(SHGMemberships, #id, onDelete: KeyAction.cascade)();
  IntColumn get meetingId => integer()
      .nullable()
      .references(SHGMeetings, #id, onDelete: KeyAction.setNull)();
  RealColumn get amount => real()();
  DateTimeColumn get date => dateTime().withDefault(currentDateAndTime)();
}

@DataClassName('SHGLoan')
class SHGLoans extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get membershipId =>
      integer().references(SHGMemberships, #id, onDelete: KeyAction.cascade)();
  TextColumn get principalAmount => text()();
  TextColumn get interestRate => text()(); // monthly interest rate percentage
  DateTimeColumn get loanDate => dateTime()();
  IntColumn get durationMonths => integer()();
  TextColumn get purpose => text().nullable()();
  TextColumn get status =>
      text().withDefault(const Constant('Active'))(); // Active, Closed
}

@DataClassName('SHGLoanRepayment')
class SHGLoanRepayments extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get loanId =>
      integer().references(SHGLoans, #id, onDelete: KeyAction.cascade)();
  IntColumn get meetingId => integer()
      .nullable()
      .references(SHGMeetings, #id, onDelete: KeyAction.setNull)();
  TextColumn get principalPaid => text()();
  TextColumn get interestPaid => text()();
  DateTimeColumn get date => dateTime().withDefault(currentDateAndTime)();
}

@DataClassName('SHGAttendance')
class SHGAttendances extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get meetingId =>
      integer().references(SHGMeetings, #id, onDelete: KeyAction.cascade)();
  IntColumn get membershipId =>
      integer().references(SHGMemberships, #id, onDelete: KeyAction.cascade)();
  BoolColumn get isPresent => boolean().withDefault(const Constant(true))();
  RealColumn get fineAmount =>
      real().withDefault(const Constant(0.0))(); // Fine for absence
}

@DataClassName('SHGCashBook')
class SHGCashBooks extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get groupId =>
      integer().references(SHGGroups, #id, onDelete: KeyAction.cascade)();
  DateTimeColumn get date => dateTime().withDefault(currentDateAndTime)();
  TextColumn get transactionType => text()(); // Income, Expense
  TextColumn get category =>
      text()(); // e.g. Savings, Bank Interest, Penalty, Loan Disbursement
  RealColumn get amount => real()();
  TextColumn get description => text().nullable()();
}
