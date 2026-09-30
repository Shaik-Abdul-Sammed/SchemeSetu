// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $MembersTable extends Members with TableInfo<$MembersTable, Member> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $MembersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _phoneMeta = const VerificationMeta('phone');
  @override
  late final GeneratedColumn<String> phone = GeneratedColumn<String>(
      'phone', aliasedName, false,
      additionalChecks:
          GeneratedColumn.checkTextLength(minTextLength: 10, maxTextLength: 15),
      type: DriftSqlType.string,
      requiredDuringInsert: true);
  static const VerificationMeta _whatsappMeta =
      const VerificationMeta('whatsapp');
  @override
  late final GeneratedColumn<String> whatsapp = GeneratedColumn<String>(
      'whatsapp', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _addressMeta =
      const VerificationMeta('address');
  @override
  late final GeneratedColumn<String> address = GeneratedColumn<String>(
      'address', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _occupationMeta =
      const VerificationMeta('occupation');
  @override
  late final GeneratedColumn<String> occupation = GeneratedColumn<String>(
      'occupation', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _joiningDateMeta =
      const VerificationMeta('joiningDate');
  @override
  late final GeneratedColumn<DateTime> joiningDate = GeneratedColumn<DateTime>(
      'joining_date', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('Active'));
  static const VerificationMeta _photoPathMeta =
      const VerificationMeta('photoPath');
  @override
  late final GeneratedColumn<String> photoPath = GeneratedColumn<String>(
      'photo_path', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _trustScoreMeta =
      const VerificationMeta('trustScore');
  @override
  late final GeneratedColumn<double> trustScore = GeneratedColumn<double>(
      'trust_score', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _pinMeta = const VerificationMeta('pin');
  @override
  late final GeneratedColumn<String> pin = GeneratedColumn<String>(
      'pin', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        name,
        phone,
        whatsapp,
        address,
        occupation,
        joiningDate,
        status,
        photoPath,
        trustScore,
        pin
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'members';
  @override
  VerificationContext validateIntegrity(Insertable<Member> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('phone')) {
      context.handle(
          _phoneMeta, phone.isAcceptableOrUnknown(data['phone']!, _phoneMeta));
    } else if (isInserting) {
      context.missing(_phoneMeta);
    }
    if (data.containsKey('whatsapp')) {
      context.handle(_whatsappMeta,
          whatsapp.isAcceptableOrUnknown(data['whatsapp']!, _whatsappMeta));
    }
    if (data.containsKey('address')) {
      context.handle(_addressMeta,
          address.isAcceptableOrUnknown(data['address']!, _addressMeta));
    }
    if (data.containsKey('occupation')) {
      context.handle(
          _occupationMeta,
          occupation.isAcceptableOrUnknown(
              data['occupation']!, _occupationMeta));
    }
    if (data.containsKey('joining_date')) {
      context.handle(
          _joiningDateMeta,
          joiningDate.isAcceptableOrUnknown(
              data['joining_date']!, _joiningDateMeta));
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    if (data.containsKey('photo_path')) {
      context.handle(_photoPathMeta,
          photoPath.isAcceptableOrUnknown(data['photo_path']!, _photoPathMeta));
    }
    if (data.containsKey('trust_score')) {
      context.handle(
          _trustScoreMeta,
          trustScore.isAcceptableOrUnknown(
              data['trust_score']!, _trustScoreMeta));
    }
    if (data.containsKey('pin')) {
      context.handle(
          _pinMeta, pin.isAcceptableOrUnknown(data['pin']!, _pinMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Member map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Member(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      phone: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}phone'])!,
      whatsapp: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}whatsapp']),
      address: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}address']),
      occupation: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}occupation']),
      joiningDate: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}joining_date'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      photoPath: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}photo_path']),
      trustScore: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}trust_score']),
      pin: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}pin']),
    );
  }

  @override
  $MembersTable createAlias(String alias) {
    return $MembersTable(attachedDatabase, alias);
  }
}

class Member extends DataClass implements Insertable<Member> {
  final int id;
  final String name;
  final String phone;
  final String? whatsapp;
  final String? address;
  final String? occupation;
  final DateTime joiningDate;
  final String status;
  final String? photoPath;
  final double? trustScore;
  final String? pin;
  const Member(
      {required this.id,
      required this.name,
      required this.phone,
      this.whatsapp,
      this.address,
      this.occupation,
      required this.joiningDate,
      required this.status,
      this.photoPath,
      this.trustScore,
      this.pin});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['name'] = Variable<String>(name);
    map['phone'] = Variable<String>(phone);
    if (!nullToAbsent || whatsapp != null) {
      map['whatsapp'] = Variable<String>(whatsapp);
    }
    if (!nullToAbsent || address != null) {
      map['address'] = Variable<String>(address);
    }
    if (!nullToAbsent || occupation != null) {
      map['occupation'] = Variable<String>(occupation);
    }
    map['joining_date'] = Variable<DateTime>(joiningDate);
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || photoPath != null) {
      map['photo_path'] = Variable<String>(photoPath);
    }
    if (!nullToAbsent || trustScore != null) {
      map['trust_score'] = Variable<double>(trustScore);
    }
    if (!nullToAbsent || pin != null) {
      map['pin'] = Variable<String>(pin);
    }
    return map;
  }

  MembersCompanion toCompanion(bool nullToAbsent) {
    return MembersCompanion(
      id: Value(id),
      name: Value(name),
      phone: Value(phone),
      whatsapp: whatsapp == null && nullToAbsent
          ? const Value.absent()
          : Value(whatsapp),
      address: address == null && nullToAbsent
          ? const Value.absent()
          : Value(address),
      occupation: occupation == null && nullToAbsent
          ? const Value.absent()
          : Value(occupation),
      joiningDate: Value(joiningDate),
      status: Value(status),
      photoPath: photoPath == null && nullToAbsent
          ? const Value.absent()
          : Value(photoPath),
      trustScore: trustScore == null && nullToAbsent
          ? const Value.absent()
          : Value(trustScore),
      pin: pin == null && nullToAbsent ? const Value.absent() : Value(pin),
    );
  }

  factory Member.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Member(
      id: serializer.fromJson<int>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      phone: serializer.fromJson<String>(json['phone']),
      whatsapp: serializer.fromJson<String?>(json['whatsapp']),
      address: serializer.fromJson<String?>(json['address']),
      occupation: serializer.fromJson<String?>(json['occupation']),
      joiningDate: serializer.fromJson<DateTime>(json['joiningDate']),
      status: serializer.fromJson<String>(json['status']),
      photoPath: serializer.fromJson<String?>(json['photoPath']),
      trustScore: serializer.fromJson<double?>(json['trustScore']),
      pin: serializer.fromJson<String?>(json['pin']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'name': serializer.toJson<String>(name),
      'phone': serializer.toJson<String>(phone),
      'whatsapp': serializer.toJson<String?>(whatsapp),
      'address': serializer.toJson<String?>(address),
      'occupation': serializer.toJson<String?>(occupation),
      'joiningDate': serializer.toJson<DateTime>(joiningDate),
      'status': serializer.toJson<String>(status),
      'photoPath': serializer.toJson<String?>(photoPath),
      'trustScore': serializer.toJson<double?>(trustScore),
      'pin': serializer.toJson<String?>(pin),
    };
  }

  Member copyWith(
          {int? id,
          String? name,
          String? phone,
          Value<String?> whatsapp = const Value.absent(),
          Value<String?> address = const Value.absent(),
          Value<String?> occupation = const Value.absent(),
          DateTime? joiningDate,
          String? status,
          Value<String?> photoPath = const Value.absent(),
          Value<double?> trustScore = const Value.absent(),
          Value<String?> pin = const Value.absent()}) =>
      Member(
        id: id ?? this.id,
        name: name ?? this.name,
        phone: phone ?? this.phone,
        whatsapp: whatsapp.present ? whatsapp.value : this.whatsapp,
        address: address.present ? address.value : this.address,
        occupation: occupation.present ? occupation.value : this.occupation,
        joiningDate: joiningDate ?? this.joiningDate,
        status: status ?? this.status,
        photoPath: photoPath.present ? photoPath.value : this.photoPath,
        trustScore: trustScore.present ? trustScore.value : this.trustScore,
        pin: pin.present ? pin.value : this.pin,
      );
  Member copyWithCompanion(MembersCompanion data) {
    return Member(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      phone: data.phone.present ? data.phone.value : this.phone,
      whatsapp: data.whatsapp.present ? data.whatsapp.value : this.whatsapp,
      address: data.address.present ? data.address.value : this.address,
      occupation:
          data.occupation.present ? data.occupation.value : this.occupation,
      joiningDate:
          data.joiningDate.present ? data.joiningDate.value : this.joiningDate,
      status: data.status.present ? data.status.value : this.status,
      photoPath: data.photoPath.present ? data.photoPath.value : this.photoPath,
      trustScore:
          data.trustScore.present ? data.trustScore.value : this.trustScore,
      pin: data.pin.present ? data.pin.value : this.pin,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Member(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('phone: $phone, ')
          ..write('whatsapp: $whatsapp, ')
          ..write('address: $address, ')
          ..write('occupation: $occupation, ')
          ..write('joiningDate: $joiningDate, ')
          ..write('status: $status, ')
          ..write('photoPath: $photoPath, ')
          ..write('trustScore: $trustScore, ')
          ..write('pin: $pin')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, name, phone, whatsapp, address,
      occupation, joiningDate, status, photoPath, trustScore, pin);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Member &&
          other.id == this.id &&
          other.name == this.name &&
          other.phone == this.phone &&
          other.whatsapp == this.whatsapp &&
          other.address == this.address &&
          other.occupation == this.occupation &&
          other.joiningDate == this.joiningDate &&
          other.status == this.status &&
          other.photoPath == this.photoPath &&
          other.trustScore == this.trustScore &&
          other.pin == this.pin);
}

class MembersCompanion extends UpdateCompanion<Member> {
  final Value<int> id;
  final Value<String> name;
  final Value<String> phone;
  final Value<String?> whatsapp;
  final Value<String?> address;
  final Value<String?> occupation;
  final Value<DateTime> joiningDate;
  final Value<String> status;
  final Value<String?> photoPath;
  final Value<double?> trustScore;
  final Value<String?> pin;
  const MembersCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.phone = const Value.absent(),
    this.whatsapp = const Value.absent(),
    this.address = const Value.absent(),
    this.occupation = const Value.absent(),
    this.joiningDate = const Value.absent(),
    this.status = const Value.absent(),
    this.photoPath = const Value.absent(),
    this.trustScore = const Value.absent(),
    this.pin = const Value.absent(),
  });
  MembersCompanion.insert({
    this.id = const Value.absent(),
    required String name,
    required String phone,
    this.whatsapp = const Value.absent(),
    this.address = const Value.absent(),
    this.occupation = const Value.absent(),
    this.joiningDate = const Value.absent(),
    this.status = const Value.absent(),
    this.photoPath = const Value.absent(),
    this.trustScore = const Value.absent(),
    this.pin = const Value.absent(),
  })  : name = Value(name),
        phone = Value(phone);
  static Insertable<Member> custom({
    Expression<int>? id,
    Expression<String>? name,
    Expression<String>? phone,
    Expression<String>? whatsapp,
    Expression<String>? address,
    Expression<String>? occupation,
    Expression<DateTime>? joiningDate,
    Expression<String>? status,
    Expression<String>? photoPath,
    Expression<double>? trustScore,
    Expression<String>? pin,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (phone != null) 'phone': phone,
      if (whatsapp != null) 'whatsapp': whatsapp,
      if (address != null) 'address': address,
      if (occupation != null) 'occupation': occupation,
      if (joiningDate != null) 'joining_date': joiningDate,
      if (status != null) 'status': status,
      if (photoPath != null) 'photo_path': photoPath,
      if (trustScore != null) 'trust_score': trustScore,
      if (pin != null) 'pin': pin,
    });
  }

  MembersCompanion copyWith(
      {Value<int>? id,
      Value<String>? name,
      Value<String>? phone,
      Value<String?>? whatsapp,
      Value<String?>? address,
      Value<String?>? occupation,
      Value<DateTime>? joiningDate,
      Value<String>? status,
      Value<String?>? photoPath,
      Value<double?>? trustScore,
      Value<String?>? pin}) {
    return MembersCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      whatsapp: whatsapp ?? this.whatsapp,
      address: address ?? this.address,
      occupation: occupation ?? this.occupation,
      joiningDate: joiningDate ?? this.joiningDate,
      status: status ?? this.status,
      photoPath: photoPath ?? this.photoPath,
      trustScore: trustScore ?? this.trustScore,
      pin: pin ?? this.pin,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (phone.present) {
      map['phone'] = Variable<String>(phone.value);
    }
    if (whatsapp.present) {
      map['whatsapp'] = Variable<String>(whatsapp.value);
    }
    if (address.present) {
      map['address'] = Variable<String>(address.value);
    }
    if (occupation.present) {
      map['occupation'] = Variable<String>(occupation.value);
    }
    if (joiningDate.present) {
      map['joining_date'] = Variable<DateTime>(joiningDate.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (photoPath.present) {
      map['photo_path'] = Variable<String>(photoPath.value);
    }
    if (trustScore.present) {
      map['trust_score'] = Variable<double>(trustScore.value);
    }
    if (pin.present) {
      map['pin'] = Variable<String>(pin.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('MembersCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('phone: $phone, ')
          ..write('whatsapp: $whatsapp, ')
          ..write('address: $address, ')
          ..write('occupation: $occupation, ')
          ..write('joiningDate: $joiningDate, ')
          ..write('status: $status, ')
          ..write('photoPath: $photoPath, ')
          ..write('trustScore: $trustScore, ')
          ..write('pin: $pin')
          ..write(')'))
        .toString();
  }
}

class $GroupsTable extends Groups with TableInfo<$GroupsTable, Group> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $GroupsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _chitValueMeta =
      const VerificationMeta('chitValue');
  @override
  late final GeneratedColumn<double> chitValue = GeneratedColumn<double>(
      'chit_value', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _totalMonthsMeta =
      const VerificationMeta('totalMonths');
  @override
  late final GeneratedColumn<int> totalMonths = GeneratedColumn<int>(
      'total_months', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _monthlyContributionMeta =
      const VerificationMeta('monthlyContribution');
  @override
  late final GeneratedColumn<double> monthlyContribution =
      GeneratedColumn<double>('monthly_contribution', aliasedName, false,
          type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _startDateMeta =
      const VerificationMeta('startDate');
  @override
  late final GeneratedColumn<DateTime> startDate = GeneratedColumn<DateTime>(
      'start_date', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('Active'));
  static const VerificationMeta _whatsappGroupLinkMeta =
      const VerificationMeta('whatsappGroupLink');
  @override
  late final GeneratedColumn<String> whatsappGroupLink =
      GeneratedColumn<String>('whatsapp_group_link', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _isDeletedMeta =
      const VerificationMeta('isDeleted');
  @override
  late final GeneratedColumn<bool> isDeleted = GeneratedColumn<bool>(
      'is_deleted', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("is_deleted" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _paymentDueDateMeta =
      const VerificationMeta('paymentDueDate');
  @override
  late final GeneratedColumn<int> paymentDueDate = GeneratedColumn<int>(
      'payment_due_date', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(15));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        name,
        chitValue,
        totalMonths,
        monthlyContribution,
        startDate,
        status,
        whatsappGroupLink,
        isDeleted,
        paymentDueDate
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'groups';
  @override
  VerificationContext validateIntegrity(Insertable<Group> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('chit_value')) {
      context.handle(_chitValueMeta,
          chitValue.isAcceptableOrUnknown(data['chit_value']!, _chitValueMeta));
    } else if (isInserting) {
      context.missing(_chitValueMeta);
    }
    if (data.containsKey('total_months')) {
      context.handle(
          _totalMonthsMeta,
          totalMonths.isAcceptableOrUnknown(
              data['total_months']!, _totalMonthsMeta));
    } else if (isInserting) {
      context.missing(_totalMonthsMeta);
    }
    if (data.containsKey('monthly_contribution')) {
      context.handle(
          _monthlyContributionMeta,
          monthlyContribution.isAcceptableOrUnknown(
              data['monthly_contribution']!, _monthlyContributionMeta));
    } else if (isInserting) {
      context.missing(_monthlyContributionMeta);
    }
    if (data.containsKey('start_date')) {
      context.handle(_startDateMeta,
          startDate.isAcceptableOrUnknown(data['start_date']!, _startDateMeta));
    } else if (isInserting) {
      context.missing(_startDateMeta);
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    if (data.containsKey('whatsapp_group_link')) {
      context.handle(
          _whatsappGroupLinkMeta,
          whatsappGroupLink.isAcceptableOrUnknown(
              data['whatsapp_group_link']!, _whatsappGroupLinkMeta));
    }
    if (data.containsKey('is_deleted')) {
      context.handle(_isDeletedMeta,
          isDeleted.isAcceptableOrUnknown(data['is_deleted']!, _isDeletedMeta));
    }
    if (data.containsKey('payment_due_date')) {
      context.handle(
          _paymentDueDateMeta,
          paymentDueDate.isAcceptableOrUnknown(
              data['payment_due_date']!, _paymentDueDateMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Group map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Group(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      chitValue: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}chit_value'])!,
      totalMonths: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}total_months'])!,
      monthlyContribution: attachedDatabase.typeMapping.read(
          DriftSqlType.double, data['${effectivePrefix}monthly_contribution'])!,
      startDate: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}start_date'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      whatsappGroupLink: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}whatsapp_group_link']),
      isDeleted: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_deleted'])!,
      paymentDueDate: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}payment_due_date'])!,
    );
  }

  @override
  $GroupsTable createAlias(String alias) {
    return $GroupsTable(attachedDatabase, alias);
  }
}

class Group extends DataClass implements Insertable<Group> {
  final int id;
  final String name;
  final double chitValue;
  final int totalMonths;
  final double monthlyContribution;
  final DateTime startDate;
  final String status;
  final String? whatsappGroupLink;
  final bool isDeleted;
  final int paymentDueDate;
  const Group(
      {required this.id,
      required this.name,
      required this.chitValue,
      required this.totalMonths,
      required this.monthlyContribution,
      required this.startDate,
      required this.status,
      this.whatsappGroupLink,
      required this.isDeleted,
      required this.paymentDueDate});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['name'] = Variable<String>(name);
    map['chit_value'] = Variable<double>(chitValue);
    map['total_months'] = Variable<int>(totalMonths);
    map['monthly_contribution'] = Variable<double>(monthlyContribution);
    map['start_date'] = Variable<DateTime>(startDate);
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || whatsappGroupLink != null) {
      map['whatsapp_group_link'] = Variable<String>(whatsappGroupLink);
    }
    map['is_deleted'] = Variable<bool>(isDeleted);
    map['payment_due_date'] = Variable<int>(paymentDueDate);
    return map;
  }

  GroupsCompanion toCompanion(bool nullToAbsent) {
    return GroupsCompanion(
      id: Value(id),
      name: Value(name),
      chitValue: Value(chitValue),
      totalMonths: Value(totalMonths),
      monthlyContribution: Value(monthlyContribution),
      startDate: Value(startDate),
      status: Value(status),
      whatsappGroupLink: whatsappGroupLink == null && nullToAbsent
          ? const Value.absent()
          : Value(whatsappGroupLink),
      isDeleted: Value(isDeleted),
      paymentDueDate: Value(paymentDueDate),
    );
  }

  factory Group.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Group(
      id: serializer.fromJson<int>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      chitValue: serializer.fromJson<double>(json['chitValue']),
      totalMonths: serializer.fromJson<int>(json['totalMonths']),
      monthlyContribution:
          serializer.fromJson<double>(json['monthlyContribution']),
      startDate: serializer.fromJson<DateTime>(json['startDate']),
      status: serializer.fromJson<String>(json['status']),
      whatsappGroupLink:
          serializer.fromJson<String?>(json['whatsappGroupLink']),
      isDeleted: serializer.fromJson<bool>(json['isDeleted']),
      paymentDueDate: serializer.fromJson<int>(json['paymentDueDate']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'name': serializer.toJson<String>(name),
      'chitValue': serializer.toJson<double>(chitValue),
      'totalMonths': serializer.toJson<int>(totalMonths),
      'monthlyContribution': serializer.toJson<double>(monthlyContribution),
      'startDate': serializer.toJson<DateTime>(startDate),
      'status': serializer.toJson<String>(status),
      'whatsappGroupLink': serializer.toJson<String?>(whatsappGroupLink),
      'isDeleted': serializer.toJson<bool>(isDeleted),
      'paymentDueDate': serializer.toJson<int>(paymentDueDate),
    };
  }

  Group copyWith(
          {int? id,
          String? name,
          double? chitValue,
          int? totalMonths,
          double? monthlyContribution,
          DateTime? startDate,
          String? status,
          Value<String?> whatsappGroupLink = const Value.absent(),
          bool? isDeleted,
          int? paymentDueDate}) =>
      Group(
        id: id ?? this.id,
        name: name ?? this.name,
        chitValue: chitValue ?? this.chitValue,
        totalMonths: totalMonths ?? this.totalMonths,
        monthlyContribution: monthlyContribution ?? this.monthlyContribution,
        startDate: startDate ?? this.startDate,
        status: status ?? this.status,
        whatsappGroupLink: whatsappGroupLink.present
            ? whatsappGroupLink.value
            : this.whatsappGroupLink,
        isDeleted: isDeleted ?? this.isDeleted,
        paymentDueDate: paymentDueDate ?? this.paymentDueDate,
      );
  Group copyWithCompanion(GroupsCompanion data) {
    return Group(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      chitValue: data.chitValue.present ? data.chitValue.value : this.chitValue,
      totalMonths:
          data.totalMonths.present ? data.totalMonths.value : this.totalMonths,
      monthlyContribution: data.monthlyContribution.present
          ? data.monthlyContribution.value
          : this.monthlyContribution,
      startDate: data.startDate.present ? data.startDate.value : this.startDate,
      status: data.status.present ? data.status.value : this.status,
      whatsappGroupLink: data.whatsappGroupLink.present
          ? data.whatsappGroupLink.value
          : this.whatsappGroupLink,
      isDeleted: data.isDeleted.present ? data.isDeleted.value : this.isDeleted,
      paymentDueDate: data.paymentDueDate.present
          ? data.paymentDueDate.value
          : this.paymentDueDate,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Group(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('chitValue: $chitValue, ')
          ..write('totalMonths: $totalMonths, ')
          ..write('monthlyContribution: $monthlyContribution, ')
          ..write('startDate: $startDate, ')
          ..write('status: $status, ')
          ..write('whatsappGroupLink: $whatsappGroupLink, ')
          ..write('isDeleted: $isDeleted, ')
          ..write('paymentDueDate: $paymentDueDate')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      name,
      chitValue,
      totalMonths,
      monthlyContribution,
      startDate,
      status,
      whatsappGroupLink,
      isDeleted,
      paymentDueDate);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Group &&
          other.id == this.id &&
          other.name == this.name &&
          other.chitValue == this.chitValue &&
          other.totalMonths == this.totalMonths &&
          other.monthlyContribution == this.monthlyContribution &&
          other.startDate == this.startDate &&
          other.status == this.status &&
          other.whatsappGroupLink == this.whatsappGroupLink &&
          other.isDeleted == this.isDeleted &&
          other.paymentDueDate == this.paymentDueDate);
}

class GroupsCompanion extends UpdateCompanion<Group> {
  final Value<int> id;
  final Value<String> name;
  final Value<double> chitValue;
  final Value<int> totalMonths;
  final Value<double> monthlyContribution;
  final Value<DateTime> startDate;
  final Value<String> status;
  final Value<String?> whatsappGroupLink;
  final Value<bool> isDeleted;
  final Value<int> paymentDueDate;
  const GroupsCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.chitValue = const Value.absent(),
    this.totalMonths = const Value.absent(),
    this.monthlyContribution = const Value.absent(),
    this.startDate = const Value.absent(),
    this.status = const Value.absent(),
    this.whatsappGroupLink = const Value.absent(),
    this.isDeleted = const Value.absent(),
    this.paymentDueDate = const Value.absent(),
  });
  GroupsCompanion.insert({
    this.id = const Value.absent(),
    required String name,
    required double chitValue,
    required int totalMonths,
    required double monthlyContribution,
    required DateTime startDate,
    this.status = const Value.absent(),
    this.whatsappGroupLink = const Value.absent(),
    this.isDeleted = const Value.absent(),
    this.paymentDueDate = const Value.absent(),
  })  : name = Value(name),
        chitValue = Value(chitValue),
        totalMonths = Value(totalMonths),
        monthlyContribution = Value(monthlyContribution),
        startDate = Value(startDate);
  static Insertable<Group> custom({
    Expression<int>? id,
    Expression<String>? name,
    Expression<double>? chitValue,
    Expression<int>? totalMonths,
    Expression<double>? monthlyContribution,
    Expression<DateTime>? startDate,
    Expression<String>? status,
    Expression<String>? whatsappGroupLink,
    Expression<bool>? isDeleted,
    Expression<int>? paymentDueDate,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (chitValue != null) 'chit_value': chitValue,
      if (totalMonths != null) 'total_months': totalMonths,
      if (monthlyContribution != null)
        'monthly_contribution': monthlyContribution,
      if (startDate != null) 'start_date': startDate,
      if (status != null) 'status': status,
      if (whatsappGroupLink != null) 'whatsapp_group_link': whatsappGroupLink,
      if (isDeleted != null) 'is_deleted': isDeleted,
      if (paymentDueDate != null) 'payment_due_date': paymentDueDate,
    });
  }

  GroupsCompanion copyWith(
      {Value<int>? id,
      Value<String>? name,
      Value<double>? chitValue,
      Value<int>? totalMonths,
      Value<double>? monthlyContribution,
      Value<DateTime>? startDate,
      Value<String>? status,
      Value<String?>? whatsappGroupLink,
      Value<bool>? isDeleted,
      Value<int>? paymentDueDate}) {
    return GroupsCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      chitValue: chitValue ?? this.chitValue,
      totalMonths: totalMonths ?? this.totalMonths,
      monthlyContribution: monthlyContribution ?? this.monthlyContribution,
      startDate: startDate ?? this.startDate,
      status: status ?? this.status,
      whatsappGroupLink: whatsappGroupLink ?? this.whatsappGroupLink,
      isDeleted: isDeleted ?? this.isDeleted,
      paymentDueDate: paymentDueDate ?? this.paymentDueDate,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (chitValue.present) {
      map['chit_value'] = Variable<double>(chitValue.value);
    }
    if (totalMonths.present) {
      map['total_months'] = Variable<int>(totalMonths.value);
    }
    if (monthlyContribution.present) {
      map['monthly_contribution'] = Variable<double>(monthlyContribution.value);
    }
    if (startDate.present) {
      map['start_date'] = Variable<DateTime>(startDate.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (whatsappGroupLink.present) {
      map['whatsapp_group_link'] = Variable<String>(whatsappGroupLink.value);
    }
    if (isDeleted.present) {
      map['is_deleted'] = Variable<bool>(isDeleted.value);
    }
    if (paymentDueDate.present) {
      map['payment_due_date'] = Variable<int>(paymentDueDate.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('GroupsCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('chitValue: $chitValue, ')
          ..write('totalMonths: $totalMonths, ')
          ..write('monthlyContribution: $monthlyContribution, ')
          ..write('startDate: $startDate, ')
          ..write('status: $status, ')
          ..write('whatsappGroupLink: $whatsappGroupLink, ')
          ..write('isDeleted: $isDeleted, ')
          ..write('paymentDueDate: $paymentDueDate')
          ..write(')'))
        .toString();
  }
}

class $MembershipsTable extends Memberships
    with TableInfo<$MembershipsTable, Membership> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $MembershipsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _memberIdMeta =
      const VerificationMeta('memberId');
  @override
  late final GeneratedColumn<int> memberId = GeneratedColumn<int>(
      'member_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES members (id) ON DELETE CASCADE'));
  static const VerificationMeta _groupIdMeta =
      const VerificationMeta('groupId');
  @override
  late final GeneratedColumn<int> groupId = GeneratedColumn<int>(
      'group_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES "groups" (id) ON DELETE CASCADE'));
  static const VerificationMeta _installmentsCountMeta =
      const VerificationMeta('installmentsCount');
  @override
  late final GeneratedColumn<double> installmentsCount =
      GeneratedColumn<double>('installments_count', aliasedName, false,
          type: DriftSqlType.double,
          requiredDuringInsert: false,
          defaultValue: const Constant(1.0));
  static const VerificationMeta _joinedAtMeta =
      const VerificationMeta('joinedAt');
  @override
  late final GeneratedColumn<DateTime> joinedAt = GeneratedColumn<DateTime>(
      'joined_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns =>
      [id, memberId, groupId, installmentsCount, joinedAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'memberships';
  @override
  VerificationContext validateIntegrity(Insertable<Membership> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('member_id')) {
      context.handle(_memberIdMeta,
          memberId.isAcceptableOrUnknown(data['member_id']!, _memberIdMeta));
    } else if (isInserting) {
      context.missing(_memberIdMeta);
    }
    if (data.containsKey('group_id')) {
      context.handle(_groupIdMeta,
          groupId.isAcceptableOrUnknown(data['group_id']!, _groupIdMeta));
    } else if (isInserting) {
      context.missing(_groupIdMeta);
    }
    if (data.containsKey('installments_count')) {
      context.handle(
          _installmentsCountMeta,
          installmentsCount.isAcceptableOrUnknown(
              data['installments_count']!, _installmentsCountMeta));
    }
    if (data.containsKey('joined_at')) {
      context.handle(_joinedAtMeta,
          joinedAt.isAcceptableOrUnknown(data['joined_at']!, _joinedAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Membership map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Membership(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      memberId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}member_id'])!,
      groupId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}group_id'])!,
      installmentsCount: attachedDatabase.typeMapping.read(
          DriftSqlType.double, data['${effectivePrefix}installments_count'])!,
      joinedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}joined_at'])!,
    );
  }

  @override
  $MembershipsTable createAlias(String alias) {
    return $MembershipsTable(attachedDatabase, alias);
  }
}

class Membership extends DataClass implements Insertable<Membership> {
  final int id;
  final int memberId;
  final int groupId;
  final double installmentsCount;
  final DateTime joinedAt;
  const Membership(
      {required this.id,
      required this.memberId,
      required this.groupId,
      required this.installmentsCount,
      required this.joinedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['member_id'] = Variable<int>(memberId);
    map['group_id'] = Variable<int>(groupId);
    map['installments_count'] = Variable<double>(installmentsCount);
    map['joined_at'] = Variable<DateTime>(joinedAt);
    return map;
  }

  MembershipsCompanion toCompanion(bool nullToAbsent) {
    return MembershipsCompanion(
      id: Value(id),
      memberId: Value(memberId),
      groupId: Value(groupId),
      installmentsCount: Value(installmentsCount),
      joinedAt: Value(joinedAt),
    );
  }

  factory Membership.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Membership(
      id: serializer.fromJson<int>(json['id']),
      memberId: serializer.fromJson<int>(json['memberId']),
      groupId: serializer.fromJson<int>(json['groupId']),
      installmentsCount: serializer.fromJson<double>(json['installmentsCount']),
      joinedAt: serializer.fromJson<DateTime>(json['joinedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'memberId': serializer.toJson<int>(memberId),
      'groupId': serializer.toJson<int>(groupId),
      'installmentsCount': serializer.toJson<double>(installmentsCount),
      'joinedAt': serializer.toJson<DateTime>(joinedAt),
    };
  }

  Membership copyWith(
          {int? id,
          int? memberId,
          int? groupId,
          double? installmentsCount,
          DateTime? joinedAt}) =>
      Membership(
        id: id ?? this.id,
        memberId: memberId ?? this.memberId,
        groupId: groupId ?? this.groupId,
        installmentsCount: installmentsCount ?? this.installmentsCount,
        joinedAt: joinedAt ?? this.joinedAt,
      );
  Membership copyWithCompanion(MembershipsCompanion data) {
    return Membership(
      id: data.id.present ? data.id.value : this.id,
      memberId: data.memberId.present ? data.memberId.value : this.memberId,
      groupId: data.groupId.present ? data.groupId.value : this.groupId,
      installmentsCount: data.installmentsCount.present
          ? data.installmentsCount.value
          : this.installmentsCount,
      joinedAt: data.joinedAt.present ? data.joinedAt.value : this.joinedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Membership(')
          ..write('id: $id, ')
          ..write('memberId: $memberId, ')
          ..write('groupId: $groupId, ')
          ..write('installmentsCount: $installmentsCount, ')
          ..write('joinedAt: $joinedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, memberId, groupId, installmentsCount, joinedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Membership &&
          other.id == this.id &&
          other.memberId == this.memberId &&
          other.groupId == this.groupId &&
          other.installmentsCount == this.installmentsCount &&
          other.joinedAt == this.joinedAt);
}

class MembershipsCompanion extends UpdateCompanion<Membership> {
  final Value<int> id;
  final Value<int> memberId;
  final Value<int> groupId;
  final Value<double> installmentsCount;
  final Value<DateTime> joinedAt;
  const MembershipsCompanion({
    this.id = const Value.absent(),
    this.memberId = const Value.absent(),
    this.groupId = const Value.absent(),
    this.installmentsCount = const Value.absent(),
    this.joinedAt = const Value.absent(),
  });
  MembershipsCompanion.insert({
    this.id = const Value.absent(),
    required int memberId,
    required int groupId,
    this.installmentsCount = const Value.absent(),
    this.joinedAt = const Value.absent(),
  })  : memberId = Value(memberId),
        groupId = Value(groupId);
  static Insertable<Membership> custom({
    Expression<int>? id,
    Expression<int>? memberId,
    Expression<int>? groupId,
    Expression<double>? installmentsCount,
    Expression<DateTime>? joinedAt,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (memberId != null) 'member_id': memberId,
      if (groupId != null) 'group_id': groupId,
      if (installmentsCount != null) 'installments_count': installmentsCount,
      if (joinedAt != null) 'joined_at': joinedAt,
    });
  }

  MembershipsCompanion copyWith(
      {Value<int>? id,
      Value<int>? memberId,
      Value<int>? groupId,
      Value<double>? installmentsCount,
      Value<DateTime>? joinedAt}) {
    return MembershipsCompanion(
      id: id ?? this.id,
      memberId: memberId ?? this.memberId,
      groupId: groupId ?? this.groupId,
      installmentsCount: installmentsCount ?? this.installmentsCount,
      joinedAt: joinedAt ?? this.joinedAt,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (memberId.present) {
      map['member_id'] = Variable<int>(memberId.value);
    }
    if (groupId.present) {
      map['group_id'] = Variable<int>(groupId.value);
    }
    if (installmentsCount.present) {
      map['installments_count'] = Variable<double>(installmentsCount.value);
    }
    if (joinedAt.present) {
      map['joined_at'] = Variable<DateTime>(joinedAt.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('MembershipsCompanion(')
          ..write('id: $id, ')
          ..write('memberId: $memberId, ')
          ..write('groupId: $groupId, ')
          ..write('installmentsCount: $installmentsCount, ')
          ..write('joinedAt: $joinedAt')
          ..write(')'))
        .toString();
  }
}

class $RoundsTable extends Rounds with TableInfo<$RoundsTable, Round> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $RoundsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _groupIdMeta =
      const VerificationMeta('groupId');
  @override
  late final GeneratedColumn<int> groupId = GeneratedColumn<int>(
      'group_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES "groups" (id) ON DELETE CASCADE'));
  static const VerificationMeta _roundNumberMeta =
      const VerificationMeta('roundNumber');
  @override
  late final GeneratedColumn<int> roundNumber = GeneratedColumn<int>(
      'round_number', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _monthMeta = const VerificationMeta('month');
  @override
  late final GeneratedColumn<int> month = GeneratedColumn<int>(
      'month', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _yearMeta = const VerificationMeta('year');
  @override
  late final GeneratedColumn<int> year = GeneratedColumn<int>(
      'year', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _bidAmountMeta =
      const VerificationMeta('bidAmount');
  @override
  late final GeneratedColumn<double> bidAmount = GeneratedColumn<double>(
      'bid_amount', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _winnerMemberIdMeta =
      const VerificationMeta('winnerMemberId');
  @override
  late final GeneratedColumn<int> winnerMemberId = GeneratedColumn<int>(
      'winner_member_id', aliasedName, true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES members (id) ON DELETE SET NULL'));
  static const VerificationMeta _foremanCommissionMeta =
      const VerificationMeta('foremanCommission');
  @override
  late final GeneratedColumn<double> foremanCommission =
      GeneratedColumn<double>('foreman_commission', aliasedName, true,
          type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _dividendDistributedMeta =
      const VerificationMeta('dividendDistributed');
  @override
  late final GeneratedColumn<double> dividendDistributed =
      GeneratedColumn<double>('dividend_distributed', aliasedName, true,
          type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _payoutStatusMeta =
      const VerificationMeta('payoutStatus');
  @override
  late final GeneratedColumn<String> payoutStatus = GeneratedColumn<String>(
      'payout_status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('Pending'));
  static const VerificationMeta _payoutDateMeta =
      const VerificationMeta('payoutDate');
  @override
  late final GeneratedColumn<DateTime> payoutDate = GeneratedColumn<DateTime>(
      'payout_date', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _guarantor1NameMeta =
      const VerificationMeta('guarantor1Name');
  @override
  late final GeneratedColumn<String> guarantor1Name = GeneratedColumn<String>(
      'guarantor1_name', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _guarantor1PhoneMeta =
      const VerificationMeta('guarantor1Phone');
  @override
  late final GeneratedColumn<String> guarantor1Phone = GeneratedColumn<String>(
      'guarantor1_phone', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _guarantor2NameMeta =
      const VerificationMeta('guarantor2Name');
  @override
  late final GeneratedColumn<String> guarantor2Name = GeneratedColumn<String>(
      'guarantor2_name', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _guarantor2PhoneMeta =
      const VerificationMeta('guarantor2Phone');
  @override
  late final GeneratedColumn<String> guarantor2Phone = GeneratedColumn<String>(
      'guarantor2_phone', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _guarantorMemberIdMeta =
      const VerificationMeta('guarantorMemberId');
  @override
  late final GeneratedColumn<int> guarantorMemberId = GeneratedColumn<int>(
      'guarantor_member_id', aliasedName, true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES members (id) ON DELETE SET NULL'));
  static const VerificationMeta _winnerPaidMeta =
      const VerificationMeta('winnerPaid');
  @override
  late final GeneratedColumn<double> winnerPaid = GeneratedColumn<double>(
      'winner_paid', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _winnerBalanceMeta =
      const VerificationMeta('winnerBalance');
  @override
  late final GeneratedColumn<double> winnerBalance = GeneratedColumn<double>(
      'winner_balance', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _winnerLeftMeta =
      const VerificationMeta('winnerLeft');
  @override
  late final GeneratedColumn<double> winnerLeft = GeneratedColumn<double>(
      'winner_left', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _winnerPaymentModeMeta =
      const VerificationMeta('winnerPaymentMode');
  @override
  late final GeneratedColumn<String> winnerPaymentMode =
      GeneratedColumn<String>('winner_payment_mode', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _winnerRemarksMeta =
      const VerificationMeta('winnerRemarks');
  @override
  late final GeneratedColumn<String> winnerRemarks = GeneratedColumn<String>(
      'winner_remarks', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _hijriDateMeta =
      const VerificationMeta('hijriDate');
  @override
  late final GeneratedColumn<String> hijriDate = GeneratedColumn<String>(
      'hijri_date', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _exchangedToMemberIdMeta =
      const VerificationMeta('exchangedToMemberId');
  @override
  late final GeneratedColumn<int> exchangedToMemberId = GeneratedColumn<int>(
      'exchanged_to_member_id', aliasedName, true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES members (id) ON DELETE SET NULL'));
  static const VerificationMeta _exchangeNoteMeta =
      const VerificationMeta('exchangeNote');
  @override
  late final GeneratedColumn<String> exchangeNote = GeneratedColumn<String>(
      'exchange_note', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        groupId,
        roundNumber,
        month,
        year,
        bidAmount,
        winnerMemberId,
        foremanCommission,
        dividendDistributed,
        payoutStatus,
        payoutDate,
        guarantor1Name,
        guarantor1Phone,
        guarantor2Name,
        guarantor2Phone,
        guarantorMemberId,
        winnerPaid,
        winnerBalance,
        winnerLeft,
        winnerPaymentMode,
        winnerRemarks,
        hijriDate,
        exchangedToMemberId,
        exchangeNote
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'rounds';
  @override
  VerificationContext validateIntegrity(Insertable<Round> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('group_id')) {
      context.handle(_groupIdMeta,
          groupId.isAcceptableOrUnknown(data['group_id']!, _groupIdMeta));
    } else if (isInserting) {
      context.missing(_groupIdMeta);
    }
    if (data.containsKey('round_number')) {
      context.handle(
          _roundNumberMeta,
          roundNumber.isAcceptableOrUnknown(
              data['round_number']!, _roundNumberMeta));
    } else if (isInserting) {
      context.missing(_roundNumberMeta);
    }
    if (data.containsKey('month')) {
      context.handle(
          _monthMeta, month.isAcceptableOrUnknown(data['month']!, _monthMeta));
    } else if (isInserting) {
      context.missing(_monthMeta);
    }
    if (data.containsKey('year')) {
      context.handle(
          _yearMeta, year.isAcceptableOrUnknown(data['year']!, _yearMeta));
    } else if (isInserting) {
      context.missing(_yearMeta);
    }
    if (data.containsKey('bid_amount')) {
      context.handle(_bidAmountMeta,
          bidAmount.isAcceptableOrUnknown(data['bid_amount']!, _bidAmountMeta));
    }
    if (data.containsKey('winner_member_id')) {
      context.handle(
          _winnerMemberIdMeta,
          winnerMemberId.isAcceptableOrUnknown(
              data['winner_member_id']!, _winnerMemberIdMeta));
    }
    if (data.containsKey('foreman_commission')) {
      context.handle(
          _foremanCommissionMeta,
          foremanCommission.isAcceptableOrUnknown(
              data['foreman_commission']!, _foremanCommissionMeta));
    }
    if (data.containsKey('dividend_distributed')) {
      context.handle(
          _dividendDistributedMeta,
          dividendDistributed.isAcceptableOrUnknown(
              data['dividend_distributed']!, _dividendDistributedMeta));
    }
    if (data.containsKey('payout_status')) {
      context.handle(
          _payoutStatusMeta,
          payoutStatus.isAcceptableOrUnknown(
              data['payout_status']!, _payoutStatusMeta));
    }
    if (data.containsKey('payout_date')) {
      context.handle(
          _payoutDateMeta,
          payoutDate.isAcceptableOrUnknown(
              data['payout_date']!, _payoutDateMeta));
    }
    if (data.containsKey('guarantor1_name')) {
      context.handle(
          _guarantor1NameMeta,
          guarantor1Name.isAcceptableOrUnknown(
              data['guarantor1_name']!, _guarantor1NameMeta));
    }
    if (data.containsKey('guarantor1_phone')) {
      context.handle(
          _guarantor1PhoneMeta,
          guarantor1Phone.isAcceptableOrUnknown(
              data['guarantor1_phone']!, _guarantor1PhoneMeta));
    }
    if (data.containsKey('guarantor2_name')) {
      context.handle(
          _guarantor2NameMeta,
          guarantor2Name.isAcceptableOrUnknown(
              data['guarantor2_name']!, _guarantor2NameMeta));
    }
    if (data.containsKey('guarantor2_phone')) {
      context.handle(
          _guarantor2PhoneMeta,
          guarantor2Phone.isAcceptableOrUnknown(
              data['guarantor2_phone']!, _guarantor2PhoneMeta));
    }
    if (data.containsKey('guarantor_member_id')) {
      context.handle(
          _guarantorMemberIdMeta,
          guarantorMemberId.isAcceptableOrUnknown(
              data['guarantor_member_id']!, _guarantorMemberIdMeta));
    }
    if (data.containsKey('winner_paid')) {
      context.handle(
          _winnerPaidMeta,
          winnerPaid.isAcceptableOrUnknown(
              data['winner_paid']!, _winnerPaidMeta));
    }
    if (data.containsKey('winner_balance')) {
      context.handle(
          _winnerBalanceMeta,
          winnerBalance.isAcceptableOrUnknown(
              data['winner_balance']!, _winnerBalanceMeta));
    }
    if (data.containsKey('winner_left')) {
      context.handle(
          _winnerLeftMeta,
          winnerLeft.isAcceptableOrUnknown(
              data['winner_left']!, _winnerLeftMeta));
    }
    if (data.containsKey('winner_payment_mode')) {
      context.handle(
          _winnerPaymentModeMeta,
          winnerPaymentMode.isAcceptableOrUnknown(
              data['winner_payment_mode']!, _winnerPaymentModeMeta));
    }
    if (data.containsKey('winner_remarks')) {
      context.handle(
          _winnerRemarksMeta,
          winnerRemarks.isAcceptableOrUnknown(
              data['winner_remarks']!, _winnerRemarksMeta));
    }
    if (data.containsKey('hijri_date')) {
      context.handle(_hijriDateMeta,
          hijriDate.isAcceptableOrUnknown(data['hijri_date']!, _hijriDateMeta));
    }
    if (data.containsKey('exchanged_to_member_id')) {
      context.handle(
          _exchangedToMemberIdMeta,
          exchangedToMemberId.isAcceptableOrUnknown(
              data['exchanged_to_member_id']!, _exchangedToMemberIdMeta));
    }
    if (data.containsKey('exchange_note')) {
      context.handle(
          _exchangeNoteMeta,
          exchangeNote.isAcceptableOrUnknown(
              data['exchange_note']!, _exchangeNoteMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Round map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Round(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      groupId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}group_id'])!,
      roundNumber: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}round_number'])!,
      month: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}month'])!,
      year: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}year'])!,
      bidAmount: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}bid_amount']),
      winnerMemberId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}winner_member_id']),
      foremanCommission: attachedDatabase.typeMapping.read(
          DriftSqlType.double, data['${effectivePrefix}foreman_commission']),
      dividendDistributed: attachedDatabase.typeMapping.read(
          DriftSqlType.double, data['${effectivePrefix}dividend_distributed']),
      payoutStatus: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}payout_status'])!,
      payoutDate: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}payout_date']),
      guarantor1Name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}guarantor1_name']),
      guarantor1Phone: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}guarantor1_phone']),
      guarantor2Name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}guarantor2_name']),
      guarantor2Phone: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}guarantor2_phone']),
      guarantorMemberId: attachedDatabase.typeMapping.read(
          DriftSqlType.int, data['${effectivePrefix}guarantor_member_id']),
      winnerPaid: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}winner_paid']),
      winnerBalance: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}winner_balance']),
      winnerLeft: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}winner_left']),
      winnerPaymentMode: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}winner_payment_mode']),
      winnerRemarks: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}winner_remarks']),
      hijriDate: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}hijri_date']),
      exchangedToMemberId: attachedDatabase.typeMapping.read(
          DriftSqlType.int, data['${effectivePrefix}exchanged_to_member_id']),
      exchangeNote: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}exchange_note']),
    );
  }

  @override
  $RoundsTable createAlias(String alias) {
    return $RoundsTable(attachedDatabase, alias);
  }
}

class Round extends DataClass implements Insertable<Round> {
  final int id;
  final int groupId;
  final int roundNumber;
  final int month;
  final int year;
  final double? bidAmount;
  final int? winnerMemberId;
  final double? foremanCommission;
  final double? dividendDistributed;
  final String payoutStatus;
  final DateTime? payoutDate;
  final String? guarantor1Name;
  final String? guarantor1Phone;
  final String? guarantor2Name;
  final String? guarantor2Phone;
  final int? guarantorMemberId;
  final double? winnerPaid;
  final double? winnerBalance;
  final double? winnerLeft;
  final String? winnerPaymentMode;
  final String? winnerRemarks;
  final String? hijriDate;
  final int? exchangedToMemberId;
  final String? exchangeNote;
  const Round(
      {required this.id,
      required this.groupId,
      required this.roundNumber,
      required this.month,
      required this.year,
      this.bidAmount,
      this.winnerMemberId,
      this.foremanCommission,
      this.dividendDistributed,
      required this.payoutStatus,
      this.payoutDate,
      this.guarantor1Name,
      this.guarantor1Phone,
      this.guarantor2Name,
      this.guarantor2Phone,
      this.guarantorMemberId,
      this.winnerPaid,
      this.winnerBalance,
      this.winnerLeft,
      this.winnerPaymentMode,
      this.winnerRemarks,
      this.hijriDate,
      this.exchangedToMemberId,
      this.exchangeNote});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['group_id'] = Variable<int>(groupId);
    map['round_number'] = Variable<int>(roundNumber);
    map['month'] = Variable<int>(month);
    map['year'] = Variable<int>(year);
    if (!nullToAbsent || bidAmount != null) {
      map['bid_amount'] = Variable<double>(bidAmount);
    }
    if (!nullToAbsent || winnerMemberId != null) {
      map['winner_member_id'] = Variable<int>(winnerMemberId);
    }
    if (!nullToAbsent || foremanCommission != null) {
      map['foreman_commission'] = Variable<double>(foremanCommission);
    }
    if (!nullToAbsent || dividendDistributed != null) {
      map['dividend_distributed'] = Variable<double>(dividendDistributed);
    }
    map['payout_status'] = Variable<String>(payoutStatus);
    if (!nullToAbsent || payoutDate != null) {
      map['payout_date'] = Variable<DateTime>(payoutDate);
    }
    if (!nullToAbsent || guarantor1Name != null) {
      map['guarantor1_name'] = Variable<String>(guarantor1Name);
    }
    if (!nullToAbsent || guarantor1Phone != null) {
      map['guarantor1_phone'] = Variable<String>(guarantor1Phone);
    }
    if (!nullToAbsent || guarantor2Name != null) {
      map['guarantor2_name'] = Variable<String>(guarantor2Name);
    }
    if (!nullToAbsent || guarantor2Phone != null) {
      map['guarantor2_phone'] = Variable<String>(guarantor2Phone);
    }
    if (!nullToAbsent || guarantorMemberId != null) {
      map['guarantor_member_id'] = Variable<int>(guarantorMemberId);
    }
    if (!nullToAbsent || winnerPaid != null) {
      map['winner_paid'] = Variable<double>(winnerPaid);
    }
    if (!nullToAbsent || winnerBalance != null) {
      map['winner_balance'] = Variable<double>(winnerBalance);
    }
    if (!nullToAbsent || winnerLeft != null) {
      map['winner_left'] = Variable<double>(winnerLeft);
    }
    if (!nullToAbsent || winnerPaymentMode != null) {
      map['winner_payment_mode'] = Variable<String>(winnerPaymentMode);
    }
    if (!nullToAbsent || winnerRemarks != null) {
      map['winner_remarks'] = Variable<String>(winnerRemarks);
    }
    if (!nullToAbsent || hijriDate != null) {
      map['hijri_date'] = Variable<String>(hijriDate);
    }
    if (!nullToAbsent || exchangedToMemberId != null) {
      map['exchanged_to_member_id'] = Variable<int>(exchangedToMemberId);
    }
    if (!nullToAbsent || exchangeNote != null) {
      map['exchange_note'] = Variable<String>(exchangeNote);
    }
    return map;
  }

  RoundsCompanion toCompanion(bool nullToAbsent) {
    return RoundsCompanion(
      id: Value(id),
      groupId: Value(groupId),
      roundNumber: Value(roundNumber),
      month: Value(month),
      year: Value(year),
      bidAmount: bidAmount == null && nullToAbsent
          ? const Value.absent()
          : Value(bidAmount),
      winnerMemberId: winnerMemberId == null && nullToAbsent
          ? const Value.absent()
          : Value(winnerMemberId),
      foremanCommission: foremanCommission == null && nullToAbsent
          ? const Value.absent()
          : Value(foremanCommission),
      dividendDistributed: dividendDistributed == null && nullToAbsent
          ? const Value.absent()
          : Value(dividendDistributed),
      payoutStatus: Value(payoutStatus),
      payoutDate: payoutDate == null && nullToAbsent
          ? const Value.absent()
          : Value(payoutDate),
      guarantor1Name: guarantor1Name == null && nullToAbsent
          ? const Value.absent()
          : Value(guarantor1Name),
      guarantor1Phone: guarantor1Phone == null && nullToAbsent
          ? const Value.absent()
          : Value(guarantor1Phone),
      guarantor2Name: guarantor2Name == null && nullToAbsent
          ? const Value.absent()
          : Value(guarantor2Name),
      guarantor2Phone: guarantor2Phone == null && nullToAbsent
          ? const Value.absent()
          : Value(guarantor2Phone),
      guarantorMemberId: guarantorMemberId == null && nullToAbsent
          ? const Value.absent()
          : Value(guarantorMemberId),
      winnerPaid: winnerPaid == null && nullToAbsent
          ? const Value.absent()
          : Value(winnerPaid),
      winnerBalance: winnerBalance == null && nullToAbsent
          ? const Value.absent()
          : Value(winnerBalance),
      winnerLeft: winnerLeft == null && nullToAbsent
          ? const Value.absent()
          : Value(winnerLeft),
      winnerPaymentMode: winnerPaymentMode == null && nullToAbsent
          ? const Value.absent()
          : Value(winnerPaymentMode),
      winnerRemarks: winnerRemarks == null && nullToAbsent
          ? const Value.absent()
          : Value(winnerRemarks),
      hijriDate: hijriDate == null && nullToAbsent
          ? const Value.absent()
          : Value(hijriDate),
      exchangedToMemberId: exchangedToMemberId == null && nullToAbsent
          ? const Value.absent()
          : Value(exchangedToMemberId),
      exchangeNote: exchangeNote == null && nullToAbsent
          ? const Value.absent()
          : Value(exchangeNote),
    );
  }

  factory Round.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Round(
      id: serializer.fromJson<int>(json['id']),
      groupId: serializer.fromJson<int>(json['groupId']),
      roundNumber: serializer.fromJson<int>(json['roundNumber']),
      month: serializer.fromJson<int>(json['month']),
      year: serializer.fromJson<int>(json['year']),
      bidAmount: serializer.fromJson<double?>(json['bidAmount']),
      winnerMemberId: serializer.fromJson<int?>(json['winnerMemberId']),
      foremanCommission:
          serializer.fromJson<double?>(json['foremanCommission']),
      dividendDistributed:
          serializer.fromJson<double?>(json['dividendDistributed']),
      payoutStatus: serializer.fromJson<String>(json['payoutStatus']),
      payoutDate: serializer.fromJson<DateTime?>(json['payoutDate']),
      guarantor1Name: serializer.fromJson<String?>(json['guarantor1Name']),
      guarantor1Phone: serializer.fromJson<String?>(json['guarantor1Phone']),
      guarantor2Name: serializer.fromJson<String?>(json['guarantor2Name']),
      guarantor2Phone: serializer.fromJson<String?>(json['guarantor2Phone']),
      guarantorMemberId: serializer.fromJson<int?>(json['guarantorMemberId']),
      winnerPaid: serializer.fromJson<double?>(json['winnerPaid']),
      winnerBalance: serializer.fromJson<double?>(json['winnerBalance']),
      winnerLeft: serializer.fromJson<double?>(json['winnerLeft']),
      winnerPaymentMode:
          serializer.fromJson<String?>(json['winnerPaymentMode']),
      winnerRemarks: serializer.fromJson<String?>(json['winnerRemarks']),
      hijriDate: serializer.fromJson<String?>(json['hijriDate']),
      exchangedToMemberId:
          serializer.fromJson<int?>(json['exchangedToMemberId']),
      exchangeNote: serializer.fromJson<String?>(json['exchangeNote']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'groupId': serializer.toJson<int>(groupId),
      'roundNumber': serializer.toJson<int>(roundNumber),
      'month': serializer.toJson<int>(month),
      'year': serializer.toJson<int>(year),
      'bidAmount': serializer.toJson<double?>(bidAmount),
      'winnerMemberId': serializer.toJson<int?>(winnerMemberId),
      'foremanCommission': serializer.toJson<double?>(foremanCommission),
      'dividendDistributed': serializer.toJson<double?>(dividendDistributed),
      'payoutStatus': serializer.toJson<String>(payoutStatus),
      'payoutDate': serializer.toJson<DateTime?>(payoutDate),
      'guarantor1Name': serializer.toJson<String?>(guarantor1Name),
      'guarantor1Phone': serializer.toJson<String?>(guarantor1Phone),
      'guarantor2Name': serializer.toJson<String?>(guarantor2Name),
      'guarantor2Phone': serializer.toJson<String?>(guarantor2Phone),
      'guarantorMemberId': serializer.toJson<int?>(guarantorMemberId),
      'winnerPaid': serializer.toJson<double?>(winnerPaid),
      'winnerBalance': serializer.toJson<double?>(winnerBalance),
      'winnerLeft': serializer.toJson<double?>(winnerLeft),
      'winnerPaymentMode': serializer.toJson<String?>(winnerPaymentMode),
      'winnerRemarks': serializer.toJson<String?>(winnerRemarks),
      'hijriDate': serializer.toJson<String?>(hijriDate),
      'exchangedToMemberId': serializer.toJson<int?>(exchangedToMemberId),
      'exchangeNote': serializer.toJson<String?>(exchangeNote),
    };
  }

  Round copyWith(
          {int? id,
          int? groupId,
          int? roundNumber,
          int? month,
          int? year,
          Value<double?> bidAmount = const Value.absent(),
          Value<int?> winnerMemberId = const Value.absent(),
          Value<double?> foremanCommission = const Value.absent(),
          Value<double?> dividendDistributed = const Value.absent(),
          String? payoutStatus,
          Value<DateTime?> payoutDate = const Value.absent(),
          Value<String?> guarantor1Name = const Value.absent(),
          Value<String?> guarantor1Phone = const Value.absent(),
          Value<String?> guarantor2Name = const Value.absent(),
          Value<String?> guarantor2Phone = const Value.absent(),
          Value<int?> guarantorMemberId = const Value.absent(),
          Value<double?> winnerPaid = const Value.absent(),
          Value<double?> winnerBalance = const Value.absent(),
          Value<double?> winnerLeft = const Value.absent(),
          Value<String?> winnerPaymentMode = const Value.absent(),
          Value<String?> winnerRemarks = const Value.absent(),
          Value<String?> hijriDate = const Value.absent(),
          Value<int?> exchangedToMemberId = const Value.absent(),
          Value<String?> exchangeNote = const Value.absent()}) =>
      Round(
        id: id ?? this.id,
        groupId: groupId ?? this.groupId,
        roundNumber: roundNumber ?? this.roundNumber,
        month: month ?? this.month,
        year: year ?? this.year,
        bidAmount: bidAmount.present ? bidAmount.value : this.bidAmount,
        winnerMemberId:
            winnerMemberId.present ? winnerMemberId.value : this.winnerMemberId,
        foremanCommission: foremanCommission.present
            ? foremanCommission.value
            : this.foremanCommission,
        dividendDistributed: dividendDistributed.present
            ? dividendDistributed.value
            : this.dividendDistributed,
        payoutStatus: payoutStatus ?? this.payoutStatus,
        payoutDate: payoutDate.present ? payoutDate.value : this.payoutDate,
        guarantor1Name:
            guarantor1Name.present ? guarantor1Name.value : this.guarantor1Name,
        guarantor1Phone: guarantor1Phone.present
            ? guarantor1Phone.value
            : this.guarantor1Phone,
        guarantor2Name:
            guarantor2Name.present ? guarantor2Name.value : this.guarantor2Name,
        guarantor2Phone: guarantor2Phone.present
            ? guarantor2Phone.value
            : this.guarantor2Phone,
        guarantorMemberId: guarantorMemberId.present
            ? guarantorMemberId.value
            : this.guarantorMemberId,
        winnerPaid: winnerPaid.present ? winnerPaid.value : this.winnerPaid,
        winnerBalance:
            winnerBalance.present ? winnerBalance.value : this.winnerBalance,
        winnerLeft: winnerLeft.present ? winnerLeft.value : this.winnerLeft,
        winnerPaymentMode: winnerPaymentMode.present
            ? winnerPaymentMode.value
            : this.winnerPaymentMode,
        winnerRemarks:
            winnerRemarks.present ? winnerRemarks.value : this.winnerRemarks,
        hijriDate: hijriDate.present ? hijriDate.value : this.hijriDate,
        exchangedToMemberId: exchangedToMemberId.present
            ? exchangedToMemberId.value
            : this.exchangedToMemberId,
        exchangeNote:
            exchangeNote.present ? exchangeNote.value : this.exchangeNote,
      );
  Round copyWithCompanion(RoundsCompanion data) {
    return Round(
      id: data.id.present ? data.id.value : this.id,
      groupId: data.groupId.present ? data.groupId.value : this.groupId,
      roundNumber:
          data.roundNumber.present ? data.roundNumber.value : this.roundNumber,
      month: data.month.present ? data.month.value : this.month,
      year: data.year.present ? data.year.value : this.year,
      bidAmount: data.bidAmount.present ? data.bidAmount.value : this.bidAmount,
      winnerMemberId: data.winnerMemberId.present
          ? data.winnerMemberId.value
          : this.winnerMemberId,
      foremanCommission: data.foremanCommission.present
          ? data.foremanCommission.value
          : this.foremanCommission,
      dividendDistributed: data.dividendDistributed.present
          ? data.dividendDistributed.value
          : this.dividendDistributed,
      payoutStatus: data.payoutStatus.present
          ? data.payoutStatus.value
          : this.payoutStatus,
      payoutDate:
          data.payoutDate.present ? data.payoutDate.value : this.payoutDate,
      guarantor1Name: data.guarantor1Name.present
          ? data.guarantor1Name.value
          : this.guarantor1Name,
      guarantor1Phone: data.guarantor1Phone.present
          ? data.guarantor1Phone.value
          : this.guarantor1Phone,
      guarantor2Name: data.guarantor2Name.present
          ? data.guarantor2Name.value
          : this.guarantor2Name,
      guarantor2Phone: data.guarantor2Phone.present
          ? data.guarantor2Phone.value
          : this.guarantor2Phone,
      guarantorMemberId: data.guarantorMemberId.present
          ? data.guarantorMemberId.value
          : this.guarantorMemberId,
      winnerPaid:
          data.winnerPaid.present ? data.winnerPaid.value : this.winnerPaid,
      winnerBalance: data.winnerBalance.present
          ? data.winnerBalance.value
          : this.winnerBalance,
      winnerLeft:
          data.winnerLeft.present ? data.winnerLeft.value : this.winnerLeft,
      winnerPaymentMode: data.winnerPaymentMode.present
          ? data.winnerPaymentMode.value
          : this.winnerPaymentMode,
      winnerRemarks: data.winnerRemarks.present
          ? data.winnerRemarks.value
          : this.winnerRemarks,
      hijriDate: data.hijriDate.present ? data.hijriDate.value : this.hijriDate,
      exchangedToMemberId: data.exchangedToMemberId.present
          ? data.exchangedToMemberId.value
          : this.exchangedToMemberId,
      exchangeNote: data.exchangeNote.present
          ? data.exchangeNote.value
          : this.exchangeNote,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Round(')
          ..write('id: $id, ')
          ..write('groupId: $groupId, ')
          ..write('roundNumber: $roundNumber, ')
          ..write('month: $month, ')
          ..write('year: $year, ')
          ..write('bidAmount: $bidAmount, ')
          ..write('winnerMemberId: $winnerMemberId, ')
          ..write('foremanCommission: $foremanCommission, ')
          ..write('dividendDistributed: $dividendDistributed, ')
          ..write('payoutStatus: $payoutStatus, ')
          ..write('payoutDate: $payoutDate, ')
          ..write('guarantor1Name: $guarantor1Name, ')
          ..write('guarantor1Phone: $guarantor1Phone, ')
          ..write('guarantor2Name: $guarantor2Name, ')
          ..write('guarantor2Phone: $guarantor2Phone, ')
          ..write('guarantorMemberId: $guarantorMemberId, ')
          ..write('winnerPaid: $winnerPaid, ')
          ..write('winnerBalance: $winnerBalance, ')
          ..write('winnerLeft: $winnerLeft, ')
          ..write('winnerPaymentMode: $winnerPaymentMode, ')
          ..write('winnerRemarks: $winnerRemarks, ')
          ..write('hijriDate: $hijriDate, ')
          ..write('exchangedToMemberId: $exchangedToMemberId, ')
          ..write('exchangeNote: $exchangeNote')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hashAll([
        id,
        groupId,
        roundNumber,
        month,
        year,
        bidAmount,
        winnerMemberId,
        foremanCommission,
        dividendDistributed,
        payoutStatus,
        payoutDate,
        guarantor1Name,
        guarantor1Phone,
        guarantor2Name,
        guarantor2Phone,
        guarantorMemberId,
        winnerPaid,
        winnerBalance,
        winnerLeft,
        winnerPaymentMode,
        winnerRemarks,
        hijriDate,
        exchangedToMemberId,
        exchangeNote
      ]);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Round &&
          other.id == this.id &&
          other.groupId == this.groupId &&
          other.roundNumber == this.roundNumber &&
          other.month == this.month &&
          other.year == this.year &&
          other.bidAmount == this.bidAmount &&
          other.winnerMemberId == this.winnerMemberId &&
          other.foremanCommission == this.foremanCommission &&
          other.dividendDistributed == this.dividendDistributed &&
          other.payoutStatus == this.payoutStatus &&
          other.payoutDate == this.payoutDate &&
          other.guarantor1Name == this.guarantor1Name &&
          other.guarantor1Phone == this.guarantor1Phone &&
          other.guarantor2Name == this.guarantor2Name &&
          other.guarantor2Phone == this.guarantor2Phone &&
          other.guarantorMemberId == this.guarantorMemberId &&
          other.winnerPaid == this.winnerPaid &&
          other.winnerBalance == this.winnerBalance &&
          other.winnerLeft == this.winnerLeft &&
          other.winnerPaymentMode == this.winnerPaymentMode &&
          other.winnerRemarks == this.winnerRemarks &&
          other.hijriDate == this.hijriDate &&
          other.exchangedToMemberId == this.exchangedToMemberId &&
          other.exchangeNote == this.exchangeNote);
}

class RoundsCompanion extends UpdateCompanion<Round> {
  final Value<int> id;
  final Value<int> groupId;
  final Value<int> roundNumber;
  final Value<int> month;
  final Value<int> year;
  final Value<double?> bidAmount;
  final Value<int?> winnerMemberId;
  final Value<double?> foremanCommission;
  final Value<double?> dividendDistributed;
  final Value<String> payoutStatus;
  final Value<DateTime?> payoutDate;
  final Value<String?> guarantor1Name;
  final Value<String?> guarantor1Phone;
  final Value<String?> guarantor2Name;
  final Value<String?> guarantor2Phone;
  final Value<int?> guarantorMemberId;
  final Value<double?> winnerPaid;
  final Value<double?> winnerBalance;
  final Value<double?> winnerLeft;
  final Value<String?> winnerPaymentMode;
  final Value<String?> winnerRemarks;
  final Value<String?> hijriDate;
  final Value<int?> exchangedToMemberId;
  final Value<String?> exchangeNote;
  const RoundsCompanion({
    this.id = const Value.absent(),
    this.groupId = const Value.absent(),
    this.roundNumber = const Value.absent(),
    this.month = const Value.absent(),
    this.year = const Value.absent(),
    this.bidAmount = const Value.absent(),
    this.winnerMemberId = const Value.absent(),
    this.foremanCommission = const Value.absent(),
    this.dividendDistributed = const Value.absent(),
    this.payoutStatus = const Value.absent(),
    this.payoutDate = const Value.absent(),
    this.guarantor1Name = const Value.absent(),
    this.guarantor1Phone = const Value.absent(),
    this.guarantor2Name = const Value.absent(),
    this.guarantor2Phone = const Value.absent(),
    this.guarantorMemberId = const Value.absent(),
    this.winnerPaid = const Value.absent(),
    this.winnerBalance = const Value.absent(),
    this.winnerLeft = const Value.absent(),
    this.winnerPaymentMode = const Value.absent(),
    this.winnerRemarks = const Value.absent(),
    this.hijriDate = const Value.absent(),
    this.exchangedToMemberId = const Value.absent(),
    this.exchangeNote = const Value.absent(),
  });
  RoundsCompanion.insert({
    this.id = const Value.absent(),
    required int groupId,
    required int roundNumber,
    required int month,
    required int year,
    this.bidAmount = const Value.absent(),
    this.winnerMemberId = const Value.absent(),
    this.foremanCommission = const Value.absent(),
    this.dividendDistributed = const Value.absent(),
    this.payoutStatus = const Value.absent(),
    this.payoutDate = const Value.absent(),
    this.guarantor1Name = const Value.absent(),
    this.guarantor1Phone = const Value.absent(),
    this.guarantor2Name = const Value.absent(),
    this.guarantor2Phone = const Value.absent(),
    this.guarantorMemberId = const Value.absent(),
    this.winnerPaid = const Value.absent(),
    this.winnerBalance = const Value.absent(),
    this.winnerLeft = const Value.absent(),
    this.winnerPaymentMode = const Value.absent(),
    this.winnerRemarks = const Value.absent(),
    this.hijriDate = const Value.absent(),
    this.exchangedToMemberId = const Value.absent(),
    this.exchangeNote = const Value.absent(),
  })  : groupId = Value(groupId),
        roundNumber = Value(roundNumber),
        month = Value(month),
        year = Value(year);
  static Insertable<Round> custom({
    Expression<int>? id,
    Expression<int>? groupId,
    Expression<int>? roundNumber,
    Expression<int>? month,
    Expression<int>? year,
    Expression<double>? bidAmount,
    Expression<int>? winnerMemberId,
    Expression<double>? foremanCommission,
    Expression<double>? dividendDistributed,
    Expression<String>? payoutStatus,
    Expression<DateTime>? payoutDate,
    Expression<String>? guarantor1Name,
    Expression<String>? guarantor1Phone,
    Expression<String>? guarantor2Name,
    Expression<String>? guarantor2Phone,
    Expression<int>? guarantorMemberId,
    Expression<double>? winnerPaid,
    Expression<double>? winnerBalance,
    Expression<double>? winnerLeft,
    Expression<String>? winnerPaymentMode,
    Expression<String>? winnerRemarks,
    Expression<String>? hijriDate,
    Expression<int>? exchangedToMemberId,
    Expression<String>? exchangeNote,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (groupId != null) 'group_id': groupId,
      if (roundNumber != null) 'round_number': roundNumber,
      if (month != null) 'month': month,
      if (year != null) 'year': year,
      if (bidAmount != null) 'bid_amount': bidAmount,
      if (winnerMemberId != null) 'winner_member_id': winnerMemberId,
      if (foremanCommission != null) 'foreman_commission': foremanCommission,
      if (dividendDistributed != null)
        'dividend_distributed': dividendDistributed,
      if (payoutStatus != null) 'payout_status': payoutStatus,
      if (payoutDate != null) 'payout_date': payoutDate,
      if (guarantor1Name != null) 'guarantor1_name': guarantor1Name,
      if (guarantor1Phone != null) 'guarantor1_phone': guarantor1Phone,
      if (guarantor2Name != null) 'guarantor2_name': guarantor2Name,
      if (guarantor2Phone != null) 'guarantor2_phone': guarantor2Phone,
      if (guarantorMemberId != null) 'guarantor_member_id': guarantorMemberId,
      if (winnerPaid != null) 'winner_paid': winnerPaid,
      if (winnerBalance != null) 'winner_balance': winnerBalance,
      if (winnerLeft != null) 'winner_left': winnerLeft,
      if (winnerPaymentMode != null) 'winner_payment_mode': winnerPaymentMode,
      if (winnerRemarks != null) 'winner_remarks': winnerRemarks,
      if (hijriDate != null) 'hijri_date': hijriDate,
      if (exchangedToMemberId != null)
        'exchanged_to_member_id': exchangedToMemberId,
      if (exchangeNote != null) 'exchange_note': exchangeNote,
    });
  }

  RoundsCompanion copyWith(
      {Value<int>? id,
      Value<int>? groupId,
      Value<int>? roundNumber,
      Value<int>? month,
      Value<int>? year,
      Value<double?>? bidAmount,
      Value<int?>? winnerMemberId,
      Value<double?>? foremanCommission,
      Value<double?>? dividendDistributed,
      Value<String>? payoutStatus,
      Value<DateTime?>? payoutDate,
      Value<String?>? guarantor1Name,
      Value<String?>? guarantor1Phone,
      Value<String?>? guarantor2Name,
      Value<String?>? guarantor2Phone,
      Value<int?>? guarantorMemberId,
      Value<double?>? winnerPaid,
      Value<double?>? winnerBalance,
      Value<double?>? winnerLeft,
      Value<String?>? winnerPaymentMode,
      Value<String?>? winnerRemarks,
      Value<String?>? hijriDate,
      Value<int?>? exchangedToMemberId,
      Value<String?>? exchangeNote}) {
    return RoundsCompanion(
      id: id ?? this.id,
      groupId: groupId ?? this.groupId,
      roundNumber: roundNumber ?? this.roundNumber,
      month: month ?? this.month,
      year: year ?? this.year,
      bidAmount: bidAmount ?? this.bidAmount,
      winnerMemberId: winnerMemberId ?? this.winnerMemberId,
      foremanCommission: foremanCommission ?? this.foremanCommission,
      dividendDistributed: dividendDistributed ?? this.dividendDistributed,
      payoutStatus: payoutStatus ?? this.payoutStatus,
      payoutDate: payoutDate ?? this.payoutDate,
      guarantor1Name: guarantor1Name ?? this.guarantor1Name,
      guarantor1Phone: guarantor1Phone ?? this.guarantor1Phone,
      guarantor2Name: guarantor2Name ?? this.guarantor2Name,
      guarantor2Phone: guarantor2Phone ?? this.guarantor2Phone,
      guarantorMemberId: guarantorMemberId ?? this.guarantorMemberId,
      winnerPaid: winnerPaid ?? this.winnerPaid,
      winnerBalance: winnerBalance ?? this.winnerBalance,
      winnerLeft: winnerLeft ?? this.winnerLeft,
      winnerPaymentMode: winnerPaymentMode ?? this.winnerPaymentMode,
      winnerRemarks: winnerRemarks ?? this.winnerRemarks,
      hijriDate: hijriDate ?? this.hijriDate,
      exchangedToMemberId: exchangedToMemberId ?? this.exchangedToMemberId,
      exchangeNote: exchangeNote ?? this.exchangeNote,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (groupId.present) {
      map['group_id'] = Variable<int>(groupId.value);
    }
    if (roundNumber.present) {
      map['round_number'] = Variable<int>(roundNumber.value);
    }
    if (month.present) {
      map['month'] = Variable<int>(month.value);
    }
    if (year.present) {
      map['year'] = Variable<int>(year.value);
    }
    if (bidAmount.present) {
      map['bid_amount'] = Variable<double>(bidAmount.value);
    }
    if (winnerMemberId.present) {
      map['winner_member_id'] = Variable<int>(winnerMemberId.value);
    }
    if (foremanCommission.present) {
      map['foreman_commission'] = Variable<double>(foremanCommission.value);
    }
    if (dividendDistributed.present) {
      map['dividend_distributed'] = Variable<double>(dividendDistributed.value);
    }
    if (payoutStatus.present) {
      map['payout_status'] = Variable<String>(payoutStatus.value);
    }
    if (payoutDate.present) {
      map['payout_date'] = Variable<DateTime>(payoutDate.value);
    }
    if (guarantor1Name.present) {
      map['guarantor1_name'] = Variable<String>(guarantor1Name.value);
    }
    if (guarantor1Phone.present) {
      map['guarantor1_phone'] = Variable<String>(guarantor1Phone.value);
    }
    if (guarantor2Name.present) {
      map['guarantor2_name'] = Variable<String>(guarantor2Name.value);
    }
    if (guarantor2Phone.present) {
      map['guarantor2_phone'] = Variable<String>(guarantor2Phone.value);
    }
    if (guarantorMemberId.present) {
      map['guarantor_member_id'] = Variable<int>(guarantorMemberId.value);
    }
    if (winnerPaid.present) {
      map['winner_paid'] = Variable<double>(winnerPaid.value);
    }
    if (winnerBalance.present) {
      map['winner_balance'] = Variable<double>(winnerBalance.value);
    }
    if (winnerLeft.present) {
      map['winner_left'] = Variable<double>(winnerLeft.value);
    }
    if (winnerPaymentMode.present) {
      map['winner_payment_mode'] = Variable<String>(winnerPaymentMode.value);
    }
    if (winnerRemarks.present) {
      map['winner_remarks'] = Variable<String>(winnerRemarks.value);
    }
    if (hijriDate.present) {
      map['hijri_date'] = Variable<String>(hijriDate.value);
    }
    if (exchangedToMemberId.present) {
      map['exchanged_to_member_id'] = Variable<int>(exchangedToMemberId.value);
    }
    if (exchangeNote.present) {
      map['exchange_note'] = Variable<String>(exchangeNote.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('RoundsCompanion(')
          ..write('id: $id, ')
          ..write('groupId: $groupId, ')
          ..write('roundNumber: $roundNumber, ')
          ..write('month: $month, ')
          ..write('year: $year, ')
          ..write('bidAmount: $bidAmount, ')
          ..write('winnerMemberId: $winnerMemberId, ')
          ..write('foremanCommission: $foremanCommission, ')
          ..write('dividendDistributed: $dividendDistributed, ')
          ..write('payoutStatus: $payoutStatus, ')
          ..write('payoutDate: $payoutDate, ')
          ..write('guarantor1Name: $guarantor1Name, ')
          ..write('guarantor1Phone: $guarantor1Phone, ')
          ..write('guarantor2Name: $guarantor2Name, ')
          ..write('guarantor2Phone: $guarantor2Phone, ')
          ..write('guarantorMemberId: $guarantorMemberId, ')
          ..write('winnerPaid: $winnerPaid, ')
          ..write('winnerBalance: $winnerBalance, ')
          ..write('winnerLeft: $winnerLeft, ')
          ..write('winnerPaymentMode: $winnerPaymentMode, ')
          ..write('winnerRemarks: $winnerRemarks, ')
          ..write('hijriDate: $hijriDate, ')
          ..write('exchangedToMemberId: $exchangedToMemberId, ')
          ..write('exchangeNote: $exchangeNote')
          ..write(')'))
        .toString();
  }
}

class $PaymentsTable extends Payments with TableInfo<$PaymentsTable, Payment> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $PaymentsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _membershipIdMeta =
      const VerificationMeta('membershipId');
  @override
  late final GeneratedColumn<int> membershipId = GeneratedColumn<int>(
      'membership_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES memberships (id) ON DELETE CASCADE'));
  static const VerificationMeta _roundIdMeta =
      const VerificationMeta('roundId');
  @override
  late final GeneratedColumn<int> roundId = GeneratedColumn<int>(
      'round_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES rounds (id) ON DELETE CASCADE'));
  static const VerificationMeta _amountMeta = const VerificationMeta('amount');
  @override
  late final GeneratedColumn<double> amount = GeneratedColumn<double>(
      'amount', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _paymentDateMeta =
      const VerificationMeta('paymentDate');
  @override
  late final GeneratedColumn<DateTime> paymentDate = GeneratedColumn<DateTime>(
      'payment_date', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _paymentModeMeta =
      const VerificationMeta('paymentMode');
  @override
  late final GeneratedColumn<String> paymentMode = GeneratedColumn<String>(
      'payment_mode', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('Completed'));
  static const VerificationMeta _remarksMeta =
      const VerificationMeta('remarks');
  @override
  late final GeneratedColumn<String> remarks = GeneratedColumn<String>(
      'remarks', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _collectorMeta =
      const VerificationMeta('collector');
  @override
  late final GeneratedColumn<String> collector = GeneratedColumn<String>(
      'collector', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _transactionIdMeta =
      const VerificationMeta('transactionId');
  @override
  late final GeneratedColumn<String> transactionId = GeneratedColumn<String>(
      'transaction_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _receiptPhotoPathMeta =
      const VerificationMeta('receiptPhotoPath');
  @override
  late final GeneratedColumn<String> receiptPhotoPath = GeneratedColumn<String>(
      'receipt_photo_path', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _collectorNameMeta =
      const VerificationMeta('collectorName');
  @override
  late final GeneratedColumn<String> collectorName = GeneratedColumn<String>(
      'collector_name', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        membershipId,
        roundId,
        amount,
        paymentDate,
        paymentMode,
        status,
        remarks,
        collector,
        transactionId,
        receiptPhotoPath,
        collectorName
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'payments';
  @override
  VerificationContext validateIntegrity(Insertable<Payment> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('membership_id')) {
      context.handle(
          _membershipIdMeta,
          membershipId.isAcceptableOrUnknown(
              data['membership_id']!, _membershipIdMeta));
    } else if (isInserting) {
      context.missing(_membershipIdMeta);
    }
    if (data.containsKey('round_id')) {
      context.handle(_roundIdMeta,
          roundId.isAcceptableOrUnknown(data['round_id']!, _roundIdMeta));
    } else if (isInserting) {
      context.missing(_roundIdMeta);
    }
    if (data.containsKey('amount')) {
      context.handle(_amountMeta,
          amount.isAcceptableOrUnknown(data['amount']!, _amountMeta));
    } else if (isInserting) {
      context.missing(_amountMeta);
    }
    if (data.containsKey('payment_date')) {
      context.handle(
          _paymentDateMeta,
          paymentDate.isAcceptableOrUnknown(
              data['payment_date']!, _paymentDateMeta));
    }
    if (data.containsKey('payment_mode')) {
      context.handle(
          _paymentModeMeta,
          paymentMode.isAcceptableOrUnknown(
              data['payment_mode']!, _paymentModeMeta));
    } else if (isInserting) {
      context.missing(_paymentModeMeta);
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    if (data.containsKey('remarks')) {
      context.handle(_remarksMeta,
          remarks.isAcceptableOrUnknown(data['remarks']!, _remarksMeta));
    }
    if (data.containsKey('collector')) {
      context.handle(_collectorMeta,
          collector.isAcceptableOrUnknown(data['collector']!, _collectorMeta));
    }
    if (data.containsKey('transaction_id')) {
      context.handle(
          _transactionIdMeta,
          transactionId.isAcceptableOrUnknown(
              data['transaction_id']!, _transactionIdMeta));
    }
    if (data.containsKey('receipt_photo_path')) {
      context.handle(
          _receiptPhotoPathMeta,
          receiptPhotoPath.isAcceptableOrUnknown(
              data['receipt_photo_path']!, _receiptPhotoPathMeta));
    }
    if (data.containsKey('collector_name')) {
      context.handle(
          _collectorNameMeta,
          collectorName.isAcceptableOrUnknown(
              data['collector_name']!, _collectorNameMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Payment map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Payment(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      membershipId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}membership_id'])!,
      roundId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}round_id'])!,
      amount: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}amount'])!,
      paymentDate: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}payment_date'])!,
      paymentMode: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}payment_mode'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      remarks: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}remarks']),
      collector: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}collector']),
      transactionId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}transaction_id']),
      receiptPhotoPath: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}receipt_photo_path']),
      collectorName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}collector_name']),
    );
  }

  @override
  $PaymentsTable createAlias(String alias) {
    return $PaymentsTable(attachedDatabase, alias);
  }
}

class Payment extends DataClass implements Insertable<Payment> {
  final int id;
  final int membershipId;
  final int roundId;
  final double amount;
  final DateTime paymentDate;
  final String paymentMode;
  final String status;
  final String? remarks;
  final String? collector;
  final String? transactionId;
  final String? receiptPhotoPath;
  final String? collectorName;
  const Payment(
      {required this.id,
      required this.membershipId,
      required this.roundId,
      required this.amount,
      required this.paymentDate,
      required this.paymentMode,
      required this.status,
      this.remarks,
      this.collector,
      this.transactionId,
      this.receiptPhotoPath,
      this.collectorName});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['membership_id'] = Variable<int>(membershipId);
    map['round_id'] = Variable<int>(roundId);
    map['amount'] = Variable<double>(amount);
    map['payment_date'] = Variable<DateTime>(paymentDate);
    map['payment_mode'] = Variable<String>(paymentMode);
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || remarks != null) {
      map['remarks'] = Variable<String>(remarks);
    }
    if (!nullToAbsent || collector != null) {
      map['collector'] = Variable<String>(collector);
    }
    if (!nullToAbsent || transactionId != null) {
      map['transaction_id'] = Variable<String>(transactionId);
    }
    if (!nullToAbsent || receiptPhotoPath != null) {
      map['receipt_photo_path'] = Variable<String>(receiptPhotoPath);
    }
    if (!nullToAbsent || collectorName != null) {
      map['collector_name'] = Variable<String>(collectorName);
    }
    return map;
  }

  PaymentsCompanion toCompanion(bool nullToAbsent) {
    return PaymentsCompanion(
      id: Value(id),
      membershipId: Value(membershipId),
      roundId: Value(roundId),
      amount: Value(amount),
      paymentDate: Value(paymentDate),
      paymentMode: Value(paymentMode),
      status: Value(status),
      remarks: remarks == null && nullToAbsent
          ? const Value.absent()
          : Value(remarks),
      collector: collector == null && nullToAbsent
          ? const Value.absent()
          : Value(collector),
      transactionId: transactionId == null && nullToAbsent
          ? const Value.absent()
          : Value(transactionId),
      receiptPhotoPath: receiptPhotoPath == null && nullToAbsent
          ? const Value.absent()
          : Value(receiptPhotoPath),
      collectorName: collectorName == null && nullToAbsent
          ? const Value.absent()
          : Value(collectorName),
    );
  }

  factory Payment.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Payment(
      id: serializer.fromJson<int>(json['id']),
      membershipId: serializer.fromJson<int>(json['membershipId']),
      roundId: serializer.fromJson<int>(json['roundId']),
      amount: serializer.fromJson<double>(json['amount']),
      paymentDate: serializer.fromJson<DateTime>(json['paymentDate']),
      paymentMode: serializer.fromJson<String>(json['paymentMode']),
      status: serializer.fromJson<String>(json['status']),
      remarks: serializer.fromJson<String?>(json['remarks']),
      collector: serializer.fromJson<String?>(json['collector']),
      transactionId: serializer.fromJson<String?>(json['transactionId']),
      receiptPhotoPath: serializer.fromJson<String?>(json['receiptPhotoPath']),
      collectorName: serializer.fromJson<String?>(json['collectorName']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'membershipId': serializer.toJson<int>(membershipId),
      'roundId': serializer.toJson<int>(roundId),
      'amount': serializer.toJson<double>(amount),
      'paymentDate': serializer.toJson<DateTime>(paymentDate),
      'paymentMode': serializer.toJson<String>(paymentMode),
      'status': serializer.toJson<String>(status),
      'remarks': serializer.toJson<String?>(remarks),
      'collector': serializer.toJson<String?>(collector),
      'transactionId': serializer.toJson<String?>(transactionId),
      'receiptPhotoPath': serializer.toJson<String?>(receiptPhotoPath),
      'collectorName': serializer.toJson<String?>(collectorName),
    };
  }

  Payment copyWith(
          {int? id,
          int? membershipId,
          int? roundId,
          double? amount,
          DateTime? paymentDate,
          String? paymentMode,
          String? status,
          Value<String?> remarks = const Value.absent(),
          Value<String?> collector = const Value.absent(),
          Value<String?> transactionId = const Value.absent(),
          Value<String?> receiptPhotoPath = const Value.absent(),
          Value<String?> collectorName = const Value.absent()}) =>
      Payment(
        id: id ?? this.id,
        membershipId: membershipId ?? this.membershipId,
        roundId: roundId ?? this.roundId,
        amount: amount ?? this.amount,
        paymentDate: paymentDate ?? this.paymentDate,
        paymentMode: paymentMode ?? this.paymentMode,
        status: status ?? this.status,
        remarks: remarks.present ? remarks.value : this.remarks,
        collector: collector.present ? collector.value : this.collector,
        transactionId:
            transactionId.present ? transactionId.value : this.transactionId,
        receiptPhotoPath: receiptPhotoPath.present
            ? receiptPhotoPath.value
            : this.receiptPhotoPath,
        collectorName:
            collectorName.present ? collectorName.value : this.collectorName,
      );
  Payment copyWithCompanion(PaymentsCompanion data) {
    return Payment(
      id: data.id.present ? data.id.value : this.id,
      membershipId: data.membershipId.present
          ? data.membershipId.value
          : this.membershipId,
      roundId: data.roundId.present ? data.roundId.value : this.roundId,
      amount: data.amount.present ? data.amount.value : this.amount,
      paymentDate:
          data.paymentDate.present ? data.paymentDate.value : this.paymentDate,
      paymentMode:
          data.paymentMode.present ? data.paymentMode.value : this.paymentMode,
      status: data.status.present ? data.status.value : this.status,
      remarks: data.remarks.present ? data.remarks.value : this.remarks,
      collector: data.collector.present ? data.collector.value : this.collector,
      transactionId: data.transactionId.present
          ? data.transactionId.value
          : this.transactionId,
      receiptPhotoPath: data.receiptPhotoPath.present
          ? data.receiptPhotoPath.value
          : this.receiptPhotoPath,
      collectorName: data.collectorName.present
          ? data.collectorName.value
          : this.collectorName,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Payment(')
          ..write('id: $id, ')
          ..write('membershipId: $membershipId, ')
          ..write('roundId: $roundId, ')
          ..write('amount: $amount, ')
          ..write('paymentDate: $paymentDate, ')
          ..write('paymentMode: $paymentMode, ')
          ..write('status: $status, ')
          ..write('remarks: $remarks, ')
          ..write('collector: $collector, ')
          ..write('transactionId: $transactionId, ')
          ..write('receiptPhotoPath: $receiptPhotoPath, ')
          ..write('collectorName: $collectorName')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      membershipId,
      roundId,
      amount,
      paymentDate,
      paymentMode,
      status,
      remarks,
      collector,
      transactionId,
      receiptPhotoPath,
      collectorName);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Payment &&
          other.id == this.id &&
          other.membershipId == this.membershipId &&
          other.roundId == this.roundId &&
          other.amount == this.amount &&
          other.paymentDate == this.paymentDate &&
          other.paymentMode == this.paymentMode &&
          other.status == this.status &&
          other.remarks == this.remarks &&
          other.collector == this.collector &&
          other.transactionId == this.transactionId &&
          other.receiptPhotoPath == this.receiptPhotoPath &&
          other.collectorName == this.collectorName);
}

class PaymentsCompanion extends UpdateCompanion<Payment> {
  final Value<int> id;
  final Value<int> membershipId;
  final Value<int> roundId;
  final Value<double> amount;
  final Value<DateTime> paymentDate;
  final Value<String> paymentMode;
  final Value<String> status;
  final Value<String?> remarks;
  final Value<String?> collector;
  final Value<String?> transactionId;
  final Value<String?> receiptPhotoPath;
  final Value<String?> collectorName;
  const PaymentsCompanion({
    this.id = const Value.absent(),
    this.membershipId = const Value.absent(),
    this.roundId = const Value.absent(),
    this.amount = const Value.absent(),
    this.paymentDate = const Value.absent(),
    this.paymentMode = const Value.absent(),
    this.status = const Value.absent(),
    this.remarks = const Value.absent(),
    this.collector = const Value.absent(),
    this.transactionId = const Value.absent(),
    this.receiptPhotoPath = const Value.absent(),
    this.collectorName = const Value.absent(),
  });
  PaymentsCompanion.insert({
    this.id = const Value.absent(),
    required int membershipId,
    required int roundId,
    required double amount,
    this.paymentDate = const Value.absent(),
    required String paymentMode,
    this.status = const Value.absent(),
    this.remarks = const Value.absent(),
    this.collector = const Value.absent(),
    this.transactionId = const Value.absent(),
    this.receiptPhotoPath = const Value.absent(),
    this.collectorName = const Value.absent(),
  })  : membershipId = Value(membershipId),
        roundId = Value(roundId),
        amount = Value(amount),
        paymentMode = Value(paymentMode);
  static Insertable<Payment> custom({
    Expression<int>? id,
    Expression<int>? membershipId,
    Expression<int>? roundId,
    Expression<double>? amount,
    Expression<DateTime>? paymentDate,
    Expression<String>? paymentMode,
    Expression<String>? status,
    Expression<String>? remarks,
    Expression<String>? collector,
    Expression<String>? transactionId,
    Expression<String>? receiptPhotoPath,
    Expression<String>? collectorName,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (membershipId != null) 'membership_id': membershipId,
      if (roundId != null) 'round_id': roundId,
      if (amount != null) 'amount': amount,
      if (paymentDate != null) 'payment_date': paymentDate,
      if (paymentMode != null) 'payment_mode': paymentMode,
      if (status != null) 'status': status,
      if (remarks != null) 'remarks': remarks,
      if (collector != null) 'collector': collector,
      if (transactionId != null) 'transaction_id': transactionId,
      if (receiptPhotoPath != null) 'receipt_photo_path': receiptPhotoPath,
      if (collectorName != null) 'collector_name': collectorName,
    });
  }

  PaymentsCompanion copyWith(
      {Value<int>? id,
      Value<int>? membershipId,
      Value<int>? roundId,
      Value<double>? amount,
      Value<DateTime>? paymentDate,
      Value<String>? paymentMode,
      Value<String>? status,
      Value<String?>? remarks,
      Value<String?>? collector,
      Value<String?>? transactionId,
      Value<String?>? receiptPhotoPath,
      Value<String?>? collectorName}) {
    return PaymentsCompanion(
      id: id ?? this.id,
      membershipId: membershipId ?? this.membershipId,
      roundId: roundId ?? this.roundId,
      amount: amount ?? this.amount,
      paymentDate: paymentDate ?? this.paymentDate,
      paymentMode: paymentMode ?? this.paymentMode,
      status: status ?? this.status,
      remarks: remarks ?? this.remarks,
      collector: collector ?? this.collector,
      transactionId: transactionId ?? this.transactionId,
      receiptPhotoPath: receiptPhotoPath ?? this.receiptPhotoPath,
      collectorName: collectorName ?? this.collectorName,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (membershipId.present) {
      map['membership_id'] = Variable<int>(membershipId.value);
    }
    if (roundId.present) {
      map['round_id'] = Variable<int>(roundId.value);
    }
    if (amount.present) {
      map['amount'] = Variable<double>(amount.value);
    }
    if (paymentDate.present) {
      map['payment_date'] = Variable<DateTime>(paymentDate.value);
    }
    if (paymentMode.present) {
      map['payment_mode'] = Variable<String>(paymentMode.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (remarks.present) {
      map['remarks'] = Variable<String>(remarks.value);
    }
    if (collector.present) {
      map['collector'] = Variable<String>(collector.value);
    }
    if (transactionId.present) {
      map['transaction_id'] = Variable<String>(transactionId.value);
    }
    if (receiptPhotoPath.present) {
      map['receipt_photo_path'] = Variable<String>(receiptPhotoPath.value);
    }
    if (collectorName.present) {
      map['collector_name'] = Variable<String>(collectorName.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('PaymentsCompanion(')
          ..write('id: $id, ')
          ..write('membershipId: $membershipId, ')
          ..write('roundId: $roundId, ')
          ..write('amount: $amount, ')
          ..write('paymentDate: $paymentDate, ')
          ..write('paymentMode: $paymentMode, ')
          ..write('status: $status, ')
          ..write('remarks: $remarks, ')
          ..write('collector: $collector, ')
          ..write('transactionId: $transactionId, ')
          ..write('receiptPhotoPath: $receiptPhotoPath, ')
          ..write('collectorName: $collectorName')
          ..write(')'))
        .toString();
  }
}

class $AdminSettingsTable extends AdminSettings
    with TableInfo<$AdminSettingsTable, AdminSetting> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $AdminSettingsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _keyMeta = const VerificationMeta('key');
  @override
  late final GeneratedColumn<String> key = GeneratedColumn<String>(
      'key', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _valueMeta = const VerificationMeta('value');
  @override
  late final GeneratedColumn<String> value = GeneratedColumn<String>(
      'value', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [key, value];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'admin_settings';
  @override
  VerificationContext validateIntegrity(Insertable<AdminSetting> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('key')) {
      context.handle(
          _keyMeta, key.isAcceptableOrUnknown(data['key']!, _keyMeta));
    } else if (isInserting) {
      context.missing(_keyMeta);
    }
    if (data.containsKey('value')) {
      context.handle(
          _valueMeta, value.isAcceptableOrUnknown(data['value']!, _valueMeta));
    } else if (isInserting) {
      context.missing(_valueMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {key};
  @override
  AdminSetting map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return AdminSetting(
      key: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}key'])!,
      value: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}value'])!,
    );
  }

  @override
  $AdminSettingsTable createAlias(String alias) {
    return $AdminSettingsTable(attachedDatabase, alias);
  }
}

class AdminSetting extends DataClass implements Insertable<AdminSetting> {
  final String key;
  final String value;
  const AdminSetting({required this.key, required this.value});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['key'] = Variable<String>(key);
    map['value'] = Variable<String>(value);
    return map;
  }

  AdminSettingsCompanion toCompanion(bool nullToAbsent) {
    return AdminSettingsCompanion(
      key: Value(key),
      value: Value(value),
    );
  }

  factory AdminSetting.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return AdminSetting(
      key: serializer.fromJson<String>(json['key']),
      value: serializer.fromJson<String>(json['value']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'key': serializer.toJson<String>(key),
      'value': serializer.toJson<String>(value),
    };
  }

  AdminSetting copyWith({String? key, String? value}) => AdminSetting(
        key: key ?? this.key,
        value: value ?? this.value,
      );
  AdminSetting copyWithCompanion(AdminSettingsCompanion data) {
    return AdminSetting(
      key: data.key.present ? data.key.value : this.key,
      value: data.value.present ? data.value.value : this.value,
    );
  }

  @override
  String toString() {
    return (StringBuffer('AdminSetting(')
          ..write('key: $key, ')
          ..write('value: $value')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(key, value);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is AdminSetting &&
          other.key == this.key &&
          other.value == this.value);
}

class AdminSettingsCompanion extends UpdateCompanion<AdminSetting> {
  final Value<String> key;
  final Value<String> value;
  final Value<int> rowid;
  const AdminSettingsCompanion({
    this.key = const Value.absent(),
    this.value = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  AdminSettingsCompanion.insert({
    required String key,
    required String value,
    this.rowid = const Value.absent(),
  })  : key = Value(key),
        value = Value(value);
  static Insertable<AdminSetting> custom({
    Expression<String>? key,
    Expression<String>? value,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (key != null) 'key': key,
      if (value != null) 'value': value,
      if (rowid != null) 'rowid': rowid,
    });
  }

  AdminSettingsCompanion copyWith(
      {Value<String>? key, Value<String>? value, Value<int>? rowid}) {
    return AdminSettingsCompanion(
      key: key ?? this.key,
      value: value ?? this.value,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (key.present) {
      map['key'] = Variable<String>(key.value);
    }
    if (value.present) {
      map['value'] = Variable<String>(value.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('AdminSettingsCompanion(')
          ..write('key: $key, ')
          ..write('value: $value, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $AuditLogsTable extends AuditLogs
    with TableInfo<$AuditLogsTable, AuditLog> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $AuditLogsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _actionMeta = const VerificationMeta('action');
  @override
  late final GeneratedColumn<String> action = GeneratedColumn<String>(
      'action', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _targetNameMeta =
      const VerificationMeta('targetName');
  @override
  late final GeneratedColumn<String> targetName = GeneratedColumn<String>(
      'target_name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _detailsMeta =
      const VerificationMeta('details');
  @override
  late final GeneratedColumn<String> details = GeneratedColumn<String>(
      'details', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _timestampMeta =
      const VerificationMeta('timestamp');
  @override
  late final GeneratedColumn<DateTime> timestamp = GeneratedColumn<DateTime>(
      'timestamp', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns =>
      [id, action, targetName, details, timestamp];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'audit_logs';
  @override
  VerificationContext validateIntegrity(Insertable<AuditLog> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('action')) {
      context.handle(_actionMeta,
          action.isAcceptableOrUnknown(data['action']!, _actionMeta));
    } else if (isInserting) {
      context.missing(_actionMeta);
    }
    if (data.containsKey('target_name')) {
      context.handle(
          _targetNameMeta,
          targetName.isAcceptableOrUnknown(
              data['target_name']!, _targetNameMeta));
    } else if (isInserting) {
      context.missing(_targetNameMeta);
    }
    if (data.containsKey('details')) {
      context.handle(_detailsMeta,
          details.isAcceptableOrUnknown(data['details']!, _detailsMeta));
    }
    if (data.containsKey('timestamp')) {
      context.handle(_timestampMeta,
          timestamp.isAcceptableOrUnknown(data['timestamp']!, _timestampMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  AuditLog map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return AuditLog(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      action: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}action'])!,
      targetName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}target_name'])!,
      details: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}details']),
      timestamp: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}timestamp'])!,
    );
  }

  @override
  $AuditLogsTable createAlias(String alias) {
    return $AuditLogsTable(attachedDatabase, alias);
  }
}

class AuditLog extends DataClass implements Insertable<AuditLog> {
  final int id;
  final String action;
  final String targetName;
  final String? details;
  final DateTime timestamp;
  const AuditLog(
      {required this.id,
      required this.action,
      required this.targetName,
      this.details,
      required this.timestamp});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['action'] = Variable<String>(action);
    map['target_name'] = Variable<String>(targetName);
    if (!nullToAbsent || details != null) {
      map['details'] = Variable<String>(details);
    }
    map['timestamp'] = Variable<DateTime>(timestamp);
    return map;
  }

  AuditLogsCompanion toCompanion(bool nullToAbsent) {
    return AuditLogsCompanion(
      id: Value(id),
      action: Value(action),
      targetName: Value(targetName),
      details: details == null && nullToAbsent
          ? const Value.absent()
          : Value(details),
      timestamp: Value(timestamp),
    );
  }

  factory AuditLog.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return AuditLog(
      id: serializer.fromJson<int>(json['id']),
      action: serializer.fromJson<String>(json['action']),
      targetName: serializer.fromJson<String>(json['targetName']),
      details: serializer.fromJson<String?>(json['details']),
      timestamp: serializer.fromJson<DateTime>(json['timestamp']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'action': serializer.toJson<String>(action),
      'targetName': serializer.toJson<String>(targetName),
      'details': serializer.toJson<String?>(details),
      'timestamp': serializer.toJson<DateTime>(timestamp),
    };
  }

  AuditLog copyWith(
          {int? id,
          String? action,
          String? targetName,
          Value<String?> details = const Value.absent(),
          DateTime? timestamp}) =>
      AuditLog(
        id: id ?? this.id,
        action: action ?? this.action,
        targetName: targetName ?? this.targetName,
        details: details.present ? details.value : this.details,
        timestamp: timestamp ?? this.timestamp,
      );
  AuditLog copyWithCompanion(AuditLogsCompanion data) {
    return AuditLog(
      id: data.id.present ? data.id.value : this.id,
      action: data.action.present ? data.action.value : this.action,
      targetName:
          data.targetName.present ? data.targetName.value : this.targetName,
      details: data.details.present ? data.details.value : this.details,
      timestamp: data.timestamp.present ? data.timestamp.value : this.timestamp,
    );
  }

  @override
  String toString() {
    return (StringBuffer('AuditLog(')
          ..write('id: $id, ')
          ..write('action: $action, ')
          ..write('targetName: $targetName, ')
          ..write('details: $details, ')
          ..write('timestamp: $timestamp')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, action, targetName, details, timestamp);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is AuditLog &&
          other.id == this.id &&
          other.action == this.action &&
          other.targetName == this.targetName &&
          other.details == this.details &&
          other.timestamp == this.timestamp);
}

class AuditLogsCompanion extends UpdateCompanion<AuditLog> {
  final Value<int> id;
  final Value<String> action;
  final Value<String> targetName;
  final Value<String?> details;
  final Value<DateTime> timestamp;
  const AuditLogsCompanion({
    this.id = const Value.absent(),
    this.action = const Value.absent(),
    this.targetName = const Value.absent(),
    this.details = const Value.absent(),
    this.timestamp = const Value.absent(),
  });
  AuditLogsCompanion.insert({
    this.id = const Value.absent(),
    required String action,
    required String targetName,
    this.details = const Value.absent(),
    this.timestamp = const Value.absent(),
  })  : action = Value(action),
        targetName = Value(targetName);
  static Insertable<AuditLog> custom({
    Expression<int>? id,
    Expression<String>? action,
    Expression<String>? targetName,
    Expression<String>? details,
    Expression<DateTime>? timestamp,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (action != null) 'action': action,
      if (targetName != null) 'target_name': targetName,
      if (details != null) 'details': details,
      if (timestamp != null) 'timestamp': timestamp,
    });
  }

  AuditLogsCompanion copyWith(
      {Value<int>? id,
      Value<String>? action,
      Value<String>? targetName,
      Value<String?>? details,
      Value<DateTime>? timestamp}) {
    return AuditLogsCompanion(
      id: id ?? this.id,
      action: action ?? this.action,
      targetName: targetName ?? this.targetName,
      details: details ?? this.details,
      timestamp: timestamp ?? this.timestamp,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (action.present) {
      map['action'] = Variable<String>(action.value);
    }
    if (targetName.present) {
      map['target_name'] = Variable<String>(targetName.value);
    }
    if (details.present) {
      map['details'] = Variable<String>(details.value);
    }
    if (timestamp.present) {
      map['timestamp'] = Variable<DateTime>(timestamp.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('AuditLogsCompanion(')
          ..write('id: $id, ')
          ..write('action: $action, ')
          ..write('targetName: $targetName, ')
          ..write('details: $details, ')
          ..write('timestamp: $timestamp')
          ..write(')'))
        .toString();
  }
}

class $SHGGroupsTable extends SHGGroups
    with TableInfo<$SHGGroupsTable, SHGGroup> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SHGGroupsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _formationDateMeta =
      const VerificationMeta('formationDate');
  @override
  late final GeneratedColumn<DateTime> formationDate =
      GeneratedColumn<DateTime>('formation_date', aliasedName, false,
          type: DriftSqlType.dateTime,
          requiredDuringInsert: false,
          defaultValue: currentDateAndTime);
  static const VerificationMeta _monthlySavingAmountMeta =
      const VerificationMeta('monthlySavingAmount');
  @override
  late final GeneratedColumn<double> monthlySavingAmount =
      GeneratedColumn<double>('monthly_saving_amount', aliasedName, false,
          type: DriftSqlType.double,
          requiredDuringInsert: false,
          defaultValue: const Constant(0.0));
  static const VerificationMeta _bankAccountNumberMeta =
      const VerificationMeta('bankAccountNumber');
  @override
  late final GeneratedColumn<String> bankAccountNumber =
      GeneratedColumn<String>('bank_account_number', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _ifscCodeMeta =
      const VerificationMeta('ifscCode');
  @override
  late final GeneratedColumn<String> ifscCode = GeneratedColumn<String>(
      'ifsc_code', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _bankNameMeta =
      const VerificationMeta('bankName');
  @override
  late final GeneratedColumn<String> bankName = GeneratedColumn<String>(
      'bank_name', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('Active'));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        name,
        formationDate,
        monthlySavingAmount,
        bankAccountNumber,
        ifscCode,
        bankName,
        status
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 's_h_g_groups';
  @override
  VerificationContext validateIntegrity(Insertable<SHGGroup> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('formation_date')) {
      context.handle(
          _formationDateMeta,
          formationDate.isAcceptableOrUnknown(
              data['formation_date']!, _formationDateMeta));
    }
    if (data.containsKey('monthly_saving_amount')) {
      context.handle(
          _monthlySavingAmountMeta,
          monthlySavingAmount.isAcceptableOrUnknown(
              data['monthly_saving_amount']!, _monthlySavingAmountMeta));
    }
    if (data.containsKey('bank_account_number')) {
      context.handle(
          _bankAccountNumberMeta,
          bankAccountNumber.isAcceptableOrUnknown(
              data['bank_account_number']!, _bankAccountNumberMeta));
    }
    if (data.containsKey('ifsc_code')) {
      context.handle(_ifscCodeMeta,
          ifscCode.isAcceptableOrUnknown(data['ifsc_code']!, _ifscCodeMeta));
    }
    if (data.containsKey('bank_name')) {
      context.handle(_bankNameMeta,
          bankName.isAcceptableOrUnknown(data['bank_name']!, _bankNameMeta));
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SHGGroup map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SHGGroup(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      formationDate: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}formation_date'])!,
      monthlySavingAmount: attachedDatabase.typeMapping.read(
          DriftSqlType.double,
          data['${effectivePrefix}monthly_saving_amount'])!,
      bankAccountNumber: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}bank_account_number']),
      ifscCode: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}ifsc_code']),
      bankName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}bank_name']),
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
    );
  }

  @override
  $SHGGroupsTable createAlias(String alias) {
    return $SHGGroupsTable(attachedDatabase, alias);
  }
}

class SHGGroup extends DataClass implements Insertable<SHGGroup> {
  final int id;
  final String name;
  final DateTime formationDate;
  final double monthlySavingAmount;
  final String? bankAccountNumber;
  final String? ifscCode;
  final String? bankName;
  final String status;
  const SHGGroup(
      {required this.id,
      required this.name,
      required this.formationDate,
      required this.monthlySavingAmount,
      this.bankAccountNumber,
      this.ifscCode,
      this.bankName,
      required this.status});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['name'] = Variable<String>(name);
    map['formation_date'] = Variable<DateTime>(formationDate);
    map['monthly_saving_amount'] = Variable<double>(monthlySavingAmount);
    if (!nullToAbsent || bankAccountNumber != null) {
      map['bank_account_number'] = Variable<String>(bankAccountNumber);
    }
    if (!nullToAbsent || ifscCode != null) {
      map['ifsc_code'] = Variable<String>(ifscCode);
    }
    if (!nullToAbsent || bankName != null) {
      map['bank_name'] = Variable<String>(bankName);
    }
    map['status'] = Variable<String>(status);
    return map;
  }

  SHGGroupsCompanion toCompanion(bool nullToAbsent) {
    return SHGGroupsCompanion(
      id: Value(id),
      name: Value(name),
      formationDate: Value(formationDate),
      monthlySavingAmount: Value(monthlySavingAmount),
      bankAccountNumber: bankAccountNumber == null && nullToAbsent
          ? const Value.absent()
          : Value(bankAccountNumber),
      ifscCode: ifscCode == null && nullToAbsent
          ? const Value.absent()
          : Value(ifscCode),
      bankName: bankName == null && nullToAbsent
          ? const Value.absent()
          : Value(bankName),
      status: Value(status),
    );
  }

  factory SHGGroup.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SHGGroup(
      id: serializer.fromJson<int>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      formationDate: serializer.fromJson<DateTime>(json['formationDate']),
      monthlySavingAmount:
          serializer.fromJson<double>(json['monthlySavingAmount']),
      bankAccountNumber:
          serializer.fromJson<String?>(json['bankAccountNumber']),
      ifscCode: serializer.fromJson<String?>(json['ifscCode']),
      bankName: serializer.fromJson<String?>(json['bankName']),
      status: serializer.fromJson<String>(json['status']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'name': serializer.toJson<String>(name),
      'formationDate': serializer.toJson<DateTime>(formationDate),
      'monthlySavingAmount': serializer.toJson<double>(monthlySavingAmount),
      'bankAccountNumber': serializer.toJson<String?>(bankAccountNumber),
      'ifscCode': serializer.toJson<String?>(ifscCode),
      'bankName': serializer.toJson<String?>(bankName),
      'status': serializer.toJson<String>(status),
    };
  }

  SHGGroup copyWith(
          {int? id,
          String? name,
          DateTime? formationDate,
          double? monthlySavingAmount,
          Value<String?> bankAccountNumber = const Value.absent(),
          Value<String?> ifscCode = const Value.absent(),
          Value<String?> bankName = const Value.absent(),
          String? status}) =>
      SHGGroup(
        id: id ?? this.id,
        name: name ?? this.name,
        formationDate: formationDate ?? this.formationDate,
        monthlySavingAmount: monthlySavingAmount ?? this.monthlySavingAmount,
        bankAccountNumber: bankAccountNumber.present
            ? bankAccountNumber.value
            : this.bankAccountNumber,
        ifscCode: ifscCode.present ? ifscCode.value : this.ifscCode,
        bankName: bankName.present ? bankName.value : this.bankName,
        status: status ?? this.status,
      );
  SHGGroup copyWithCompanion(SHGGroupsCompanion data) {
    return SHGGroup(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      formationDate: data.formationDate.present
          ? data.formationDate.value
          : this.formationDate,
      monthlySavingAmount: data.monthlySavingAmount.present
          ? data.monthlySavingAmount.value
          : this.monthlySavingAmount,
      bankAccountNumber: data.bankAccountNumber.present
          ? data.bankAccountNumber.value
          : this.bankAccountNumber,
      ifscCode: data.ifscCode.present ? data.ifscCode.value : this.ifscCode,
      bankName: data.bankName.present ? data.bankName.value : this.bankName,
      status: data.status.present ? data.status.value : this.status,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SHGGroup(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('formationDate: $formationDate, ')
          ..write('monthlySavingAmount: $monthlySavingAmount, ')
          ..write('bankAccountNumber: $bankAccountNumber, ')
          ..write('ifscCode: $ifscCode, ')
          ..write('bankName: $bankName, ')
          ..write('status: $status')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, name, formationDate, monthlySavingAmount,
      bankAccountNumber, ifscCode, bankName, status);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SHGGroup &&
          other.id == this.id &&
          other.name == this.name &&
          other.formationDate == this.formationDate &&
          other.monthlySavingAmount == this.monthlySavingAmount &&
          other.bankAccountNumber == this.bankAccountNumber &&
          other.ifscCode == this.ifscCode &&
          other.bankName == this.bankName &&
          other.status == this.status);
}

class SHGGroupsCompanion extends UpdateCompanion<SHGGroup> {
  final Value<int> id;
  final Value<String> name;
  final Value<DateTime> formationDate;
  final Value<double> monthlySavingAmount;
  final Value<String?> bankAccountNumber;
  final Value<String?> ifscCode;
  final Value<String?> bankName;
  final Value<String> status;
  const SHGGroupsCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.formationDate = const Value.absent(),
    this.monthlySavingAmount = const Value.absent(),
    this.bankAccountNumber = const Value.absent(),
    this.ifscCode = const Value.absent(),
    this.bankName = const Value.absent(),
    this.status = const Value.absent(),
  });
  SHGGroupsCompanion.insert({
    this.id = const Value.absent(),
    required String name,
    this.formationDate = const Value.absent(),
    this.monthlySavingAmount = const Value.absent(),
    this.bankAccountNumber = const Value.absent(),
    this.ifscCode = const Value.absent(),
    this.bankName = const Value.absent(),
    this.status = const Value.absent(),
  }) : name = Value(name);
  static Insertable<SHGGroup> custom({
    Expression<int>? id,
    Expression<String>? name,
    Expression<DateTime>? formationDate,
    Expression<double>? monthlySavingAmount,
    Expression<String>? bankAccountNumber,
    Expression<String>? ifscCode,
    Expression<String>? bankName,
    Expression<String>? status,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (formationDate != null) 'formation_date': formationDate,
      if (monthlySavingAmount != null)
        'monthly_saving_amount': monthlySavingAmount,
      if (bankAccountNumber != null) 'bank_account_number': bankAccountNumber,
      if (ifscCode != null) 'ifsc_code': ifscCode,
      if (bankName != null) 'bank_name': bankName,
      if (status != null) 'status': status,
    });
  }

  SHGGroupsCompanion copyWith(
      {Value<int>? id,
      Value<String>? name,
      Value<DateTime>? formationDate,
      Value<double>? monthlySavingAmount,
      Value<String?>? bankAccountNumber,
      Value<String?>? ifscCode,
      Value<String?>? bankName,
      Value<String>? status}) {
    return SHGGroupsCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      formationDate: formationDate ?? this.formationDate,
      monthlySavingAmount: monthlySavingAmount ?? this.monthlySavingAmount,
      bankAccountNumber: bankAccountNumber ?? this.bankAccountNumber,
      ifscCode: ifscCode ?? this.ifscCode,
      bankName: bankName ?? this.bankName,
      status: status ?? this.status,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (formationDate.present) {
      map['formation_date'] = Variable<DateTime>(formationDate.value);
    }
    if (monthlySavingAmount.present) {
      map['monthly_saving_amount'] =
          Variable<double>(monthlySavingAmount.value);
    }
    if (bankAccountNumber.present) {
      map['bank_account_number'] = Variable<String>(bankAccountNumber.value);
    }
    if (ifscCode.present) {
      map['ifsc_code'] = Variable<String>(ifscCode.value);
    }
    if (bankName.present) {
      map['bank_name'] = Variable<String>(bankName.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SHGGroupsCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('formationDate: $formationDate, ')
          ..write('monthlySavingAmount: $monthlySavingAmount, ')
          ..write('bankAccountNumber: $bankAccountNumber, ')
          ..write('ifscCode: $ifscCode, ')
          ..write('bankName: $bankName, ')
          ..write('status: $status')
          ..write(')'))
        .toString();
  }
}

class $SHGMembershipsTable extends SHGMemberships
    with TableInfo<$SHGMembershipsTable, SHGMembership> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SHGMembershipsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _memberIdMeta =
      const VerificationMeta('memberId');
  @override
  late final GeneratedColumn<int> memberId = GeneratedColumn<int>(
      'member_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES members (id) ON DELETE CASCADE'));
  static const VerificationMeta _groupIdMeta =
      const VerificationMeta('groupId');
  @override
  late final GeneratedColumn<int> groupId = GeneratedColumn<int>(
      'group_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES s_h_g_groups (id) ON DELETE CASCADE'));
  static const VerificationMeta _joinedAtMeta =
      const VerificationMeta('joinedAt');
  @override
  late final GeneratedColumn<DateTime> joinedAt = GeneratedColumn<DateTime>(
      'joined_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _roleMeta = const VerificationMeta('role');
  @override
  late final GeneratedColumn<String> role = GeneratedColumn<String>(
      'role', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('Member'));
  @override
  List<GeneratedColumn> get $columns => [id, memberId, groupId, joinedAt, role];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 's_h_g_memberships';
  @override
  VerificationContext validateIntegrity(Insertable<SHGMembership> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('member_id')) {
      context.handle(_memberIdMeta,
          memberId.isAcceptableOrUnknown(data['member_id']!, _memberIdMeta));
    } else if (isInserting) {
      context.missing(_memberIdMeta);
    }
    if (data.containsKey('group_id')) {
      context.handle(_groupIdMeta,
          groupId.isAcceptableOrUnknown(data['group_id']!, _groupIdMeta));
    } else if (isInserting) {
      context.missing(_groupIdMeta);
    }
    if (data.containsKey('joined_at')) {
      context.handle(_joinedAtMeta,
          joinedAt.isAcceptableOrUnknown(data['joined_at']!, _joinedAtMeta));
    }
    if (data.containsKey('role')) {
      context.handle(
          _roleMeta, role.isAcceptableOrUnknown(data['role']!, _roleMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SHGMembership map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SHGMembership(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      memberId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}member_id'])!,
      groupId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}group_id'])!,
      joinedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}joined_at'])!,
      role: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}role'])!,
    );
  }

  @override
  $SHGMembershipsTable createAlias(String alias) {
    return $SHGMembershipsTable(attachedDatabase, alias);
  }
}

class SHGMembership extends DataClass implements Insertable<SHGMembership> {
  final int id;
  final int memberId;
  final int groupId;
  final DateTime joinedAt;
  final String role;
  const SHGMembership(
      {required this.id,
      required this.memberId,
      required this.groupId,
      required this.joinedAt,
      required this.role});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['member_id'] = Variable<int>(memberId);
    map['group_id'] = Variable<int>(groupId);
    map['joined_at'] = Variable<DateTime>(joinedAt);
    map['role'] = Variable<String>(role);
    return map;
  }

  SHGMembershipsCompanion toCompanion(bool nullToAbsent) {
    return SHGMembershipsCompanion(
      id: Value(id),
      memberId: Value(memberId),
      groupId: Value(groupId),
      joinedAt: Value(joinedAt),
      role: Value(role),
    );
  }

  factory SHGMembership.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SHGMembership(
      id: serializer.fromJson<int>(json['id']),
      memberId: serializer.fromJson<int>(json['memberId']),
      groupId: serializer.fromJson<int>(json['groupId']),
      joinedAt: serializer.fromJson<DateTime>(json['joinedAt']),
      role: serializer.fromJson<String>(json['role']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'memberId': serializer.toJson<int>(memberId),
      'groupId': serializer.toJson<int>(groupId),
      'joinedAt': serializer.toJson<DateTime>(joinedAt),
      'role': serializer.toJson<String>(role),
    };
  }

  SHGMembership copyWith(
          {int? id,
          int? memberId,
          int? groupId,
          DateTime? joinedAt,
          String? role}) =>
      SHGMembership(
        id: id ?? this.id,
        memberId: memberId ?? this.memberId,
        groupId: groupId ?? this.groupId,
        joinedAt: joinedAt ?? this.joinedAt,
        role: role ?? this.role,
      );
  SHGMembership copyWithCompanion(SHGMembershipsCompanion data) {
    return SHGMembership(
      id: data.id.present ? data.id.value : this.id,
      memberId: data.memberId.present ? data.memberId.value : this.memberId,
      groupId: data.groupId.present ? data.groupId.value : this.groupId,
      joinedAt: data.joinedAt.present ? data.joinedAt.value : this.joinedAt,
      role: data.role.present ? data.role.value : this.role,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SHGMembership(')
          ..write('id: $id, ')
          ..write('memberId: $memberId, ')
          ..write('groupId: $groupId, ')
          ..write('joinedAt: $joinedAt, ')
          ..write('role: $role')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, memberId, groupId, joinedAt, role);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SHGMembership &&
          other.id == this.id &&
          other.memberId == this.memberId &&
          other.groupId == this.groupId &&
          other.joinedAt == this.joinedAt &&
          other.role == this.role);
}

class SHGMembershipsCompanion extends UpdateCompanion<SHGMembership> {
  final Value<int> id;
  final Value<int> memberId;
  final Value<int> groupId;
  final Value<DateTime> joinedAt;
  final Value<String> role;
  const SHGMembershipsCompanion({
    this.id = const Value.absent(),
    this.memberId = const Value.absent(),
    this.groupId = const Value.absent(),
    this.joinedAt = const Value.absent(),
    this.role = const Value.absent(),
  });
  SHGMembershipsCompanion.insert({
    this.id = const Value.absent(),
    required int memberId,
    required int groupId,
    this.joinedAt = const Value.absent(),
    this.role = const Value.absent(),
  })  : memberId = Value(memberId),
        groupId = Value(groupId);
  static Insertable<SHGMembership> custom({
    Expression<int>? id,
    Expression<int>? memberId,
    Expression<int>? groupId,
    Expression<DateTime>? joinedAt,
    Expression<String>? role,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (memberId != null) 'member_id': memberId,
      if (groupId != null) 'group_id': groupId,
      if (joinedAt != null) 'joined_at': joinedAt,
      if (role != null) 'role': role,
    });
  }

  SHGMembershipsCompanion copyWith(
      {Value<int>? id,
      Value<int>? memberId,
      Value<int>? groupId,
      Value<DateTime>? joinedAt,
      Value<String>? role}) {
    return SHGMembershipsCompanion(
      id: id ?? this.id,
      memberId: memberId ?? this.memberId,
      groupId: groupId ?? this.groupId,
      joinedAt: joinedAt ?? this.joinedAt,
      role: role ?? this.role,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (memberId.present) {
      map['member_id'] = Variable<int>(memberId.value);
    }
    if (groupId.present) {
      map['group_id'] = Variable<int>(groupId.value);
    }
    if (joinedAt.present) {
      map['joined_at'] = Variable<DateTime>(joinedAt.value);
    }
    if (role.present) {
      map['role'] = Variable<String>(role.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SHGMembershipsCompanion(')
          ..write('id: $id, ')
          ..write('memberId: $memberId, ')
          ..write('groupId: $groupId, ')
          ..write('joinedAt: $joinedAt, ')
          ..write('role: $role')
          ..write(')'))
        .toString();
  }
}

class $SHGMeetingsTable extends SHGMeetings
    with TableInfo<$SHGMeetingsTable, SHGMeeting> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SHGMeetingsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _groupIdMeta =
      const VerificationMeta('groupId');
  @override
  late final GeneratedColumn<int> groupId = GeneratedColumn<int>(
      'group_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES s_h_g_groups (id) ON DELETE CASCADE'));
  static const VerificationMeta _meetingDateMeta =
      const VerificationMeta('meetingDate');
  @override
  late final GeneratedColumn<DateTime> meetingDate = GeneratedColumn<DateTime>(
      'meeting_date', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _resolutionNoteMeta =
      const VerificationMeta('resolutionNote');
  @override
  late final GeneratedColumn<String> resolutionNote = GeneratedColumn<String>(
      'resolution_note', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _conductedByMeta =
      const VerificationMeta('conductedBy');
  @override
  late final GeneratedColumn<String> conductedBy = GeneratedColumn<String>(
      'conducted_by', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns =>
      [id, groupId, meetingDate, resolutionNote, conductedBy];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 's_h_g_meetings';
  @override
  VerificationContext validateIntegrity(Insertable<SHGMeeting> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('group_id')) {
      context.handle(_groupIdMeta,
          groupId.isAcceptableOrUnknown(data['group_id']!, _groupIdMeta));
    } else if (isInserting) {
      context.missing(_groupIdMeta);
    }
    if (data.containsKey('meeting_date')) {
      context.handle(
          _meetingDateMeta,
          meetingDate.isAcceptableOrUnknown(
              data['meeting_date']!, _meetingDateMeta));
    } else if (isInserting) {
      context.missing(_meetingDateMeta);
    }
    if (data.containsKey('resolution_note')) {
      context.handle(
          _resolutionNoteMeta,
          resolutionNote.isAcceptableOrUnknown(
              data['resolution_note']!, _resolutionNoteMeta));
    }
    if (data.containsKey('conducted_by')) {
      context.handle(
          _conductedByMeta,
          conductedBy.isAcceptableOrUnknown(
              data['conducted_by']!, _conductedByMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SHGMeeting map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SHGMeeting(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      groupId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}group_id'])!,
      meetingDate: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}meeting_date'])!,
      resolutionNote: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}resolution_note']),
      conductedBy: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}conducted_by']),
    );
  }

  @override
  $SHGMeetingsTable createAlias(String alias) {
    return $SHGMeetingsTable(attachedDatabase, alias);
  }
}

class SHGMeeting extends DataClass implements Insertable<SHGMeeting> {
  final int id;
  final int groupId;
  final DateTime meetingDate;
  final String? resolutionNote;
  final String? conductedBy;
  const SHGMeeting(
      {required this.id,
      required this.groupId,
      required this.meetingDate,
      this.resolutionNote,
      this.conductedBy});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['group_id'] = Variable<int>(groupId);
    map['meeting_date'] = Variable<DateTime>(meetingDate);
    if (!nullToAbsent || resolutionNote != null) {
      map['resolution_note'] = Variable<String>(resolutionNote);
    }
    if (!nullToAbsent || conductedBy != null) {
      map['conducted_by'] = Variable<String>(conductedBy);
    }
    return map;
  }

  SHGMeetingsCompanion toCompanion(bool nullToAbsent) {
    return SHGMeetingsCompanion(
      id: Value(id),
      groupId: Value(groupId),
      meetingDate: Value(meetingDate),
      resolutionNote: resolutionNote == null && nullToAbsent
          ? const Value.absent()
          : Value(resolutionNote),
      conductedBy: conductedBy == null && nullToAbsent
          ? const Value.absent()
          : Value(conductedBy),
    );
  }

  factory SHGMeeting.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SHGMeeting(
      id: serializer.fromJson<int>(json['id']),
      groupId: serializer.fromJson<int>(json['groupId']),
      meetingDate: serializer.fromJson<DateTime>(json['meetingDate']),
      resolutionNote: serializer.fromJson<String?>(json['resolutionNote']),
      conductedBy: serializer.fromJson<String?>(json['conductedBy']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'groupId': serializer.toJson<int>(groupId),
      'meetingDate': serializer.toJson<DateTime>(meetingDate),
      'resolutionNote': serializer.toJson<String?>(resolutionNote),
      'conductedBy': serializer.toJson<String?>(conductedBy),
    };
  }

  SHGMeeting copyWith(
          {int? id,
          int? groupId,
          DateTime? meetingDate,
          Value<String?> resolutionNote = const Value.absent(),
          Value<String?> conductedBy = const Value.absent()}) =>
      SHGMeeting(
        id: id ?? this.id,
        groupId: groupId ?? this.groupId,
        meetingDate: meetingDate ?? this.meetingDate,
        resolutionNote:
            resolutionNote.present ? resolutionNote.value : this.resolutionNote,
        conductedBy: conductedBy.present ? conductedBy.value : this.conductedBy,
      );
  SHGMeeting copyWithCompanion(SHGMeetingsCompanion data) {
    return SHGMeeting(
      id: data.id.present ? data.id.value : this.id,
      groupId: data.groupId.present ? data.groupId.value : this.groupId,
      meetingDate:
          data.meetingDate.present ? data.meetingDate.value : this.meetingDate,
      resolutionNote: data.resolutionNote.present
          ? data.resolutionNote.value
          : this.resolutionNote,
      conductedBy:
          data.conductedBy.present ? data.conductedBy.value : this.conductedBy,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SHGMeeting(')
          ..write('id: $id, ')
          ..write('groupId: $groupId, ')
          ..write('meetingDate: $meetingDate, ')
          ..write('resolutionNote: $resolutionNote, ')
          ..write('conductedBy: $conductedBy')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, groupId, meetingDate, resolutionNote, conductedBy);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SHGMeeting &&
          other.id == this.id &&
          other.groupId == this.groupId &&
          other.meetingDate == this.meetingDate &&
          other.resolutionNote == this.resolutionNote &&
          other.conductedBy == this.conductedBy);
}

class SHGMeetingsCompanion extends UpdateCompanion<SHGMeeting> {
  final Value<int> id;
  final Value<int> groupId;
  final Value<DateTime> meetingDate;
  final Value<String?> resolutionNote;
  final Value<String?> conductedBy;
  const SHGMeetingsCompanion({
    this.id = const Value.absent(),
    this.groupId = const Value.absent(),
    this.meetingDate = const Value.absent(),
    this.resolutionNote = const Value.absent(),
    this.conductedBy = const Value.absent(),
  });
  SHGMeetingsCompanion.insert({
    this.id = const Value.absent(),
    required int groupId,
    required DateTime meetingDate,
    this.resolutionNote = const Value.absent(),
    this.conductedBy = const Value.absent(),
  })  : groupId = Value(groupId),
        meetingDate = Value(meetingDate);
  static Insertable<SHGMeeting> custom({
    Expression<int>? id,
    Expression<int>? groupId,
    Expression<DateTime>? meetingDate,
    Expression<String>? resolutionNote,
    Expression<String>? conductedBy,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (groupId != null) 'group_id': groupId,
      if (meetingDate != null) 'meeting_date': meetingDate,
      if (resolutionNote != null) 'resolution_note': resolutionNote,
      if (conductedBy != null) 'conducted_by': conductedBy,
    });
  }

  SHGMeetingsCompanion copyWith(
      {Value<int>? id,
      Value<int>? groupId,
      Value<DateTime>? meetingDate,
      Value<String?>? resolutionNote,
      Value<String?>? conductedBy}) {
    return SHGMeetingsCompanion(
      id: id ?? this.id,
      groupId: groupId ?? this.groupId,
      meetingDate: meetingDate ?? this.meetingDate,
      resolutionNote: resolutionNote ?? this.resolutionNote,
      conductedBy: conductedBy ?? this.conductedBy,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (groupId.present) {
      map['group_id'] = Variable<int>(groupId.value);
    }
    if (meetingDate.present) {
      map['meeting_date'] = Variable<DateTime>(meetingDate.value);
    }
    if (resolutionNote.present) {
      map['resolution_note'] = Variable<String>(resolutionNote.value);
    }
    if (conductedBy.present) {
      map['conducted_by'] = Variable<String>(conductedBy.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SHGMeetingsCompanion(')
          ..write('id: $id, ')
          ..write('groupId: $groupId, ')
          ..write('meetingDate: $meetingDate, ')
          ..write('resolutionNote: $resolutionNote, ')
          ..write('conductedBy: $conductedBy')
          ..write(')'))
        .toString();
  }
}

class $SHGSavingsTable extends SHGSavings
    with TableInfo<$SHGSavingsTable, SHGSaving> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SHGSavingsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _membershipIdMeta =
      const VerificationMeta('membershipId');
  @override
  late final GeneratedColumn<int> membershipId = GeneratedColumn<int>(
      'membership_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES s_h_g_memberships (id) ON DELETE CASCADE'));
  static const VerificationMeta _meetingIdMeta =
      const VerificationMeta('meetingId');
  @override
  late final GeneratedColumn<int> meetingId = GeneratedColumn<int>(
      'meeting_id', aliasedName, true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES s_h_g_meetings (id) ON DELETE SET NULL'));
  static const VerificationMeta _amountMeta = const VerificationMeta('amount');
  @override
  late final GeneratedColumn<double> amount = GeneratedColumn<double>(
      'amount', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _dateMeta = const VerificationMeta('date');
  @override
  late final GeneratedColumn<DateTime> date = GeneratedColumn<DateTime>(
      'date', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns =>
      [id, membershipId, meetingId, amount, date];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 's_h_g_savings';
  @override
  VerificationContext validateIntegrity(Insertable<SHGSaving> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('membership_id')) {
      context.handle(
          _membershipIdMeta,
          membershipId.isAcceptableOrUnknown(
              data['membership_id']!, _membershipIdMeta));
    } else if (isInserting) {
      context.missing(_membershipIdMeta);
    }
    if (data.containsKey('meeting_id')) {
      context.handle(_meetingIdMeta,
          meetingId.isAcceptableOrUnknown(data['meeting_id']!, _meetingIdMeta));
    }
    if (data.containsKey('amount')) {
      context.handle(_amountMeta,
          amount.isAcceptableOrUnknown(data['amount']!, _amountMeta));
    } else if (isInserting) {
      context.missing(_amountMeta);
    }
    if (data.containsKey('date')) {
      context.handle(
          _dateMeta, date.isAcceptableOrUnknown(data['date']!, _dateMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SHGSaving map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SHGSaving(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      membershipId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}membership_id'])!,
      meetingId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}meeting_id']),
      amount: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}amount'])!,
      date: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}date'])!,
    );
  }

  @override
  $SHGSavingsTable createAlias(String alias) {
    return $SHGSavingsTable(attachedDatabase, alias);
  }
}

class SHGSaving extends DataClass implements Insertable<SHGSaving> {
  final int id;
  final int membershipId;
  final int? meetingId;
  final double amount;
  final DateTime date;
  const SHGSaving(
      {required this.id,
      required this.membershipId,
      this.meetingId,
      required this.amount,
      required this.date});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['membership_id'] = Variable<int>(membershipId);
    if (!nullToAbsent || meetingId != null) {
      map['meeting_id'] = Variable<int>(meetingId);
    }
    map['amount'] = Variable<double>(amount);
    map['date'] = Variable<DateTime>(date);
    return map;
  }

  SHGSavingsCompanion toCompanion(bool nullToAbsent) {
    return SHGSavingsCompanion(
      id: Value(id),
      membershipId: Value(membershipId),
      meetingId: meetingId == null && nullToAbsent
          ? const Value.absent()
          : Value(meetingId),
      amount: Value(amount),
      date: Value(date),
    );
  }

  factory SHGSaving.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SHGSaving(
      id: serializer.fromJson<int>(json['id']),
      membershipId: serializer.fromJson<int>(json['membershipId']),
      meetingId: serializer.fromJson<int?>(json['meetingId']),
      amount: serializer.fromJson<double>(json['amount']),
      date: serializer.fromJson<DateTime>(json['date']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'membershipId': serializer.toJson<int>(membershipId),
      'meetingId': serializer.toJson<int?>(meetingId),
      'amount': serializer.toJson<double>(amount),
      'date': serializer.toJson<DateTime>(date),
    };
  }

  SHGSaving copyWith(
          {int? id,
          int? membershipId,
          Value<int?> meetingId = const Value.absent(),
          double? amount,
          DateTime? date}) =>
      SHGSaving(
        id: id ?? this.id,
        membershipId: membershipId ?? this.membershipId,
        meetingId: meetingId.present ? meetingId.value : this.meetingId,
        amount: amount ?? this.amount,
        date: date ?? this.date,
      );
  SHGSaving copyWithCompanion(SHGSavingsCompanion data) {
    return SHGSaving(
      id: data.id.present ? data.id.value : this.id,
      membershipId: data.membershipId.present
          ? data.membershipId.value
          : this.membershipId,
      meetingId: data.meetingId.present ? data.meetingId.value : this.meetingId,
      amount: data.amount.present ? data.amount.value : this.amount,
      date: data.date.present ? data.date.value : this.date,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SHGSaving(')
          ..write('id: $id, ')
          ..write('membershipId: $membershipId, ')
          ..write('meetingId: $meetingId, ')
          ..write('amount: $amount, ')
          ..write('date: $date')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, membershipId, meetingId, amount, date);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SHGSaving &&
          other.id == this.id &&
          other.membershipId == this.membershipId &&
          other.meetingId == this.meetingId &&
          other.amount == this.amount &&
          other.date == this.date);
}

class SHGSavingsCompanion extends UpdateCompanion<SHGSaving> {
  final Value<int> id;
  final Value<int> membershipId;
  final Value<int?> meetingId;
  final Value<double> amount;
  final Value<DateTime> date;
  const SHGSavingsCompanion({
    this.id = const Value.absent(),
    this.membershipId = const Value.absent(),
    this.meetingId = const Value.absent(),
    this.amount = const Value.absent(),
    this.date = const Value.absent(),
  });
  SHGSavingsCompanion.insert({
    this.id = const Value.absent(),
    required int membershipId,
    this.meetingId = const Value.absent(),
    required double amount,
    this.date = const Value.absent(),
  })  : membershipId = Value(membershipId),
        amount = Value(amount);
  static Insertable<SHGSaving> custom({
    Expression<int>? id,
    Expression<int>? membershipId,
    Expression<int>? meetingId,
    Expression<double>? amount,
    Expression<DateTime>? date,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (membershipId != null) 'membership_id': membershipId,
      if (meetingId != null) 'meeting_id': meetingId,
      if (amount != null) 'amount': amount,
      if (date != null) 'date': date,
    });
  }

  SHGSavingsCompanion copyWith(
      {Value<int>? id,
      Value<int>? membershipId,
      Value<int?>? meetingId,
      Value<double>? amount,
      Value<DateTime>? date}) {
    return SHGSavingsCompanion(
      id: id ?? this.id,
      membershipId: membershipId ?? this.membershipId,
      meetingId: meetingId ?? this.meetingId,
      amount: amount ?? this.amount,
      date: date ?? this.date,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (membershipId.present) {
      map['membership_id'] = Variable<int>(membershipId.value);
    }
    if (meetingId.present) {
      map['meeting_id'] = Variable<int>(meetingId.value);
    }
    if (amount.present) {
      map['amount'] = Variable<double>(amount.value);
    }
    if (date.present) {
      map['date'] = Variable<DateTime>(date.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SHGSavingsCompanion(')
          ..write('id: $id, ')
          ..write('membershipId: $membershipId, ')
          ..write('meetingId: $meetingId, ')
          ..write('amount: $amount, ')
          ..write('date: $date')
          ..write(')'))
        .toString();
  }
}

class $SHGLoansTable extends SHGLoans with TableInfo<$SHGLoansTable, SHGLoan> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SHGLoansTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _membershipIdMeta =
      const VerificationMeta('membershipId');
  @override
  late final GeneratedColumn<int> membershipId = GeneratedColumn<int>(
      'membership_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES s_h_g_memberships (id) ON DELETE CASCADE'));
  static const VerificationMeta _principalAmountMeta =
      const VerificationMeta('principalAmount');
  @override
  late final GeneratedColumn<String> principalAmount = GeneratedColumn<String>(
      'principal_amount', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _interestRateMeta =
      const VerificationMeta('interestRate');
  @override
  late final GeneratedColumn<String> interestRate = GeneratedColumn<String>(
      'interest_rate', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _loanDateMeta =
      const VerificationMeta('loanDate');
  @override
  late final GeneratedColumn<DateTime> loanDate = GeneratedColumn<DateTime>(
      'loan_date', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _durationMonthsMeta =
      const VerificationMeta('durationMonths');
  @override
  late final GeneratedColumn<int> durationMonths = GeneratedColumn<int>(
      'duration_months', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _purposeMeta =
      const VerificationMeta('purpose');
  @override
  late final GeneratedColumn<String> purpose = GeneratedColumn<String>(
      'purpose', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('Active'));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        membershipId,
        principalAmount,
        interestRate,
        loanDate,
        durationMonths,
        purpose,
        status
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 's_h_g_loans';
  @override
  VerificationContext validateIntegrity(Insertable<SHGLoan> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('membership_id')) {
      context.handle(
          _membershipIdMeta,
          membershipId.isAcceptableOrUnknown(
              data['membership_id']!, _membershipIdMeta));
    } else if (isInserting) {
      context.missing(_membershipIdMeta);
    }
    if (data.containsKey('principal_amount')) {
      context.handle(
          _principalAmountMeta,
          principalAmount.isAcceptableOrUnknown(
              data['principal_amount']!, _principalAmountMeta));
    } else if (isInserting) {
      context.missing(_principalAmountMeta);
    }
    if (data.containsKey('interest_rate')) {
      context.handle(
          _interestRateMeta,
          interestRate.isAcceptableOrUnknown(
              data['interest_rate']!, _interestRateMeta));
    } else if (isInserting) {
      context.missing(_interestRateMeta);
    }
    if (data.containsKey('loan_date')) {
      context.handle(_loanDateMeta,
          loanDate.isAcceptableOrUnknown(data['loan_date']!, _loanDateMeta));
    } else if (isInserting) {
      context.missing(_loanDateMeta);
    }
    if (data.containsKey('duration_months')) {
      context.handle(
          _durationMonthsMeta,
          durationMonths.isAcceptableOrUnknown(
              data['duration_months']!, _durationMonthsMeta));
    } else if (isInserting) {
      context.missing(_durationMonthsMeta);
    }
    if (data.containsKey('purpose')) {
      context.handle(_purposeMeta,
          purpose.isAcceptableOrUnknown(data['purpose']!, _purposeMeta));
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SHGLoan map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SHGLoan(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      membershipId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}membership_id'])!,
      principalAmount: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}principal_amount'])!,
      interestRate: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}interest_rate'])!,
      loanDate: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}loan_date'])!,
      durationMonths: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}duration_months'])!,
      purpose: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}purpose']),
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
    );
  }

  @override
  $SHGLoansTable createAlias(String alias) {
    return $SHGLoansTable(attachedDatabase, alias);
  }
}

class SHGLoan extends DataClass implements Insertable<SHGLoan> {
  final int id;
  final int membershipId;
  final String principalAmount;
  final String interestRate;
  final DateTime loanDate;
  final int durationMonths;
  final String? purpose;
  final String status;
  const SHGLoan(
      {required this.id,
      required this.membershipId,
      required this.principalAmount,
      required this.interestRate,
      required this.loanDate,
      required this.durationMonths,
      this.purpose,
      required this.status});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['membership_id'] = Variable<int>(membershipId);
    map['principal_amount'] = Variable<String>(principalAmount);
    map['interest_rate'] = Variable<String>(interestRate);
    map['loan_date'] = Variable<DateTime>(loanDate);
    map['duration_months'] = Variable<int>(durationMonths);
    if (!nullToAbsent || purpose != null) {
      map['purpose'] = Variable<String>(purpose);
    }
    map['status'] = Variable<String>(status);
    return map;
  }

  SHGLoansCompanion toCompanion(bool nullToAbsent) {
    return SHGLoansCompanion(
      id: Value(id),
      membershipId: Value(membershipId),
      principalAmount: Value(principalAmount),
      interestRate: Value(interestRate),
      loanDate: Value(loanDate),
      durationMonths: Value(durationMonths),
      purpose: purpose == null && nullToAbsent
          ? const Value.absent()
          : Value(purpose),
      status: Value(status),
    );
  }

  factory SHGLoan.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SHGLoan(
      id: serializer.fromJson<int>(json['id']),
      membershipId: serializer.fromJson<int>(json['membershipId']),
      principalAmount: serializer.fromJson<String>(json['principalAmount']),
      interestRate: serializer.fromJson<String>(json['interestRate']),
      loanDate: serializer.fromJson<DateTime>(json['loanDate']),
      durationMonths: serializer.fromJson<int>(json['durationMonths']),
      purpose: serializer.fromJson<String?>(json['purpose']),
      status: serializer.fromJson<String>(json['status']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'membershipId': serializer.toJson<int>(membershipId),
      'principalAmount': serializer.toJson<String>(principalAmount),
      'interestRate': serializer.toJson<String>(interestRate),
      'loanDate': serializer.toJson<DateTime>(loanDate),
      'durationMonths': serializer.toJson<int>(durationMonths),
      'purpose': serializer.toJson<String?>(purpose),
      'status': serializer.toJson<String>(status),
    };
  }

  SHGLoan copyWith(
          {int? id,
          int? membershipId,
          String? principalAmount,
          String? interestRate,
          DateTime? loanDate,
          int? durationMonths,
          Value<String?> purpose = const Value.absent(),
          String? status}) =>
      SHGLoan(
        id: id ?? this.id,
        membershipId: membershipId ?? this.membershipId,
        principalAmount: principalAmount ?? this.principalAmount,
        interestRate: interestRate ?? this.interestRate,
        loanDate: loanDate ?? this.loanDate,
        durationMonths: durationMonths ?? this.durationMonths,
        purpose: purpose.present ? purpose.value : this.purpose,
        status: status ?? this.status,
      );
  SHGLoan copyWithCompanion(SHGLoansCompanion data) {
    return SHGLoan(
      id: data.id.present ? data.id.value : this.id,
      membershipId: data.membershipId.present
          ? data.membershipId.value
          : this.membershipId,
      principalAmount: data.principalAmount.present
          ? data.principalAmount.value
          : this.principalAmount,
      interestRate: data.interestRate.present
          ? data.interestRate.value
          : this.interestRate,
      loanDate: data.loanDate.present ? data.loanDate.value : this.loanDate,
      durationMonths: data.durationMonths.present
          ? data.durationMonths.value
          : this.durationMonths,
      purpose: data.purpose.present ? data.purpose.value : this.purpose,
      status: data.status.present ? data.status.value : this.status,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SHGLoan(')
          ..write('id: $id, ')
          ..write('membershipId: $membershipId, ')
          ..write('principalAmount: $principalAmount, ')
          ..write('interestRate: $interestRate, ')
          ..write('loanDate: $loanDate, ')
          ..write('durationMonths: $durationMonths, ')
          ..write('purpose: $purpose, ')
          ..write('status: $status')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, membershipId, principalAmount,
      interestRate, loanDate, durationMonths, purpose, status);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SHGLoan &&
          other.id == this.id &&
          other.membershipId == this.membershipId &&
          other.principalAmount == this.principalAmount &&
          other.interestRate == this.interestRate &&
          other.loanDate == this.loanDate &&
          other.durationMonths == this.durationMonths &&
          other.purpose == this.purpose &&
          other.status == this.status);
}

class SHGLoansCompanion extends UpdateCompanion<SHGLoan> {
  final Value<int> id;
  final Value<int> membershipId;
  final Value<String> principalAmount;
  final Value<String> interestRate;
  final Value<DateTime> loanDate;
  final Value<int> durationMonths;
  final Value<String?> purpose;
  final Value<String> status;
  const SHGLoansCompanion({
    this.id = const Value.absent(),
    this.membershipId = const Value.absent(),
    this.principalAmount = const Value.absent(),
    this.interestRate = const Value.absent(),
    this.loanDate = const Value.absent(),
    this.durationMonths = const Value.absent(),
    this.purpose = const Value.absent(),
    this.status = const Value.absent(),
  });
  SHGLoansCompanion.insert({
    this.id = const Value.absent(),
    required int membershipId,
    required String principalAmount,
    required String interestRate,
    required DateTime loanDate,
    required int durationMonths,
    this.purpose = const Value.absent(),
    this.status = const Value.absent(),
  })  : membershipId = Value(membershipId),
        principalAmount = Value(principalAmount),
        interestRate = Value(interestRate),
        loanDate = Value(loanDate),
        durationMonths = Value(durationMonths);
  static Insertable<SHGLoan> custom({
    Expression<int>? id,
    Expression<int>? membershipId,
    Expression<String>? principalAmount,
    Expression<String>? interestRate,
    Expression<DateTime>? loanDate,
    Expression<int>? durationMonths,
    Expression<String>? purpose,
    Expression<String>? status,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (membershipId != null) 'membership_id': membershipId,
      if (principalAmount != null) 'principal_amount': principalAmount,
      if (interestRate != null) 'interest_rate': interestRate,
      if (loanDate != null) 'loan_date': loanDate,
      if (durationMonths != null) 'duration_months': durationMonths,
      if (purpose != null) 'purpose': purpose,
      if (status != null) 'status': status,
    });
  }

  SHGLoansCompanion copyWith(
      {Value<int>? id,
      Value<int>? membershipId,
      Value<String>? principalAmount,
      Value<String>? interestRate,
      Value<DateTime>? loanDate,
      Value<int>? durationMonths,
      Value<String?>? purpose,
      Value<String>? status}) {
    return SHGLoansCompanion(
      id: id ?? this.id,
      membershipId: membershipId ?? this.membershipId,
      principalAmount: principalAmount ?? this.principalAmount,
      interestRate: interestRate ?? this.interestRate,
      loanDate: loanDate ?? this.loanDate,
      durationMonths: durationMonths ?? this.durationMonths,
      purpose: purpose ?? this.purpose,
      status: status ?? this.status,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (membershipId.present) {
      map['membership_id'] = Variable<int>(membershipId.value);
    }
    if (principalAmount.present) {
      map['principal_amount'] = Variable<String>(principalAmount.value);
    }
    if (interestRate.present) {
      map['interest_rate'] = Variable<String>(interestRate.value);
    }
    if (loanDate.present) {
      map['loan_date'] = Variable<DateTime>(loanDate.value);
    }
    if (durationMonths.present) {
      map['duration_months'] = Variable<int>(durationMonths.value);
    }
    if (purpose.present) {
      map['purpose'] = Variable<String>(purpose.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SHGLoansCompanion(')
          ..write('id: $id, ')
          ..write('membershipId: $membershipId, ')
          ..write('principalAmount: $principalAmount, ')
          ..write('interestRate: $interestRate, ')
          ..write('loanDate: $loanDate, ')
          ..write('durationMonths: $durationMonths, ')
          ..write('purpose: $purpose, ')
          ..write('status: $status')
          ..write(')'))
        .toString();
  }
}

class $SHGLoanRepaymentsTable extends SHGLoanRepayments
    with TableInfo<$SHGLoanRepaymentsTable, SHGLoanRepayment> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SHGLoanRepaymentsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _loanIdMeta = const VerificationMeta('loanId');
  @override
  late final GeneratedColumn<int> loanId = GeneratedColumn<int>(
      'loan_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES s_h_g_loans (id) ON DELETE CASCADE'));
  static const VerificationMeta _meetingIdMeta =
      const VerificationMeta('meetingId');
  @override
  late final GeneratedColumn<int> meetingId = GeneratedColumn<int>(
      'meeting_id', aliasedName, true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES s_h_g_meetings (id) ON DELETE SET NULL'));
  static const VerificationMeta _principalPaidMeta =
      const VerificationMeta('principalPaid');
  @override
  late final GeneratedColumn<String> principalPaid = GeneratedColumn<String>(
      'principal_paid', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _interestPaidMeta =
      const VerificationMeta('interestPaid');
  @override
  late final GeneratedColumn<String> interestPaid = GeneratedColumn<String>(
      'interest_paid', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _dateMeta = const VerificationMeta('date');
  @override
  late final GeneratedColumn<DateTime> date = GeneratedColumn<DateTime>(
      'date', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns =>
      [id, loanId, meetingId, principalPaid, interestPaid, date];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 's_h_g_loan_repayments';
  @override
  VerificationContext validateIntegrity(Insertable<SHGLoanRepayment> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('loan_id')) {
      context.handle(_loanIdMeta,
          loanId.isAcceptableOrUnknown(data['loan_id']!, _loanIdMeta));
    } else if (isInserting) {
      context.missing(_loanIdMeta);
    }
    if (data.containsKey('meeting_id')) {
      context.handle(_meetingIdMeta,
          meetingId.isAcceptableOrUnknown(data['meeting_id']!, _meetingIdMeta));
    }
    if (data.containsKey('principal_paid')) {
      context.handle(
          _principalPaidMeta,
          principalPaid.isAcceptableOrUnknown(
              data['principal_paid']!, _principalPaidMeta));
    } else if (isInserting) {
      context.missing(_principalPaidMeta);
    }
    if (data.containsKey('interest_paid')) {
      context.handle(
          _interestPaidMeta,
          interestPaid.isAcceptableOrUnknown(
              data['interest_paid']!, _interestPaidMeta));
    } else if (isInserting) {
      context.missing(_interestPaidMeta);
    }
    if (data.containsKey('date')) {
      context.handle(
          _dateMeta, date.isAcceptableOrUnknown(data['date']!, _dateMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SHGLoanRepayment map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SHGLoanRepayment(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      loanId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}loan_id'])!,
      meetingId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}meeting_id']),
      principalPaid: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}principal_paid'])!,
      interestPaid: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}interest_paid'])!,
      date: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}date'])!,
    );
  }

  @override
  $SHGLoanRepaymentsTable createAlias(String alias) {
    return $SHGLoanRepaymentsTable(attachedDatabase, alias);
  }
}

class SHGLoanRepayment extends DataClass
    implements Insertable<SHGLoanRepayment> {
  final int id;
  final int loanId;
  final int? meetingId;
  final String principalPaid;
  final String interestPaid;
  final DateTime date;
  const SHGLoanRepayment(
      {required this.id,
      required this.loanId,
      this.meetingId,
      required this.principalPaid,
      required this.interestPaid,
      required this.date});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['loan_id'] = Variable<int>(loanId);
    if (!nullToAbsent || meetingId != null) {
      map['meeting_id'] = Variable<int>(meetingId);
    }
    map['principal_paid'] = Variable<String>(principalPaid);
    map['interest_paid'] = Variable<String>(interestPaid);
    map['date'] = Variable<DateTime>(date);
    return map;
  }

  SHGLoanRepaymentsCompanion toCompanion(bool nullToAbsent) {
    return SHGLoanRepaymentsCompanion(
      id: Value(id),
      loanId: Value(loanId),
      meetingId: meetingId == null && nullToAbsent
          ? const Value.absent()
          : Value(meetingId),
      principalPaid: Value(principalPaid),
      interestPaid: Value(interestPaid),
      date: Value(date),
    );
  }

  factory SHGLoanRepayment.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SHGLoanRepayment(
      id: serializer.fromJson<int>(json['id']),
      loanId: serializer.fromJson<int>(json['loanId']),
      meetingId: serializer.fromJson<int?>(json['meetingId']),
      principalPaid: serializer.fromJson<String>(json['principalPaid']),
      interestPaid: serializer.fromJson<String>(json['interestPaid']),
      date: serializer.fromJson<DateTime>(json['date']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'loanId': serializer.toJson<int>(loanId),
      'meetingId': serializer.toJson<int?>(meetingId),
      'principalPaid': serializer.toJson<String>(principalPaid),
      'interestPaid': serializer.toJson<String>(interestPaid),
      'date': serializer.toJson<DateTime>(date),
    };
  }

  SHGLoanRepayment copyWith(
          {int? id,
          int? loanId,
          Value<int?> meetingId = const Value.absent(),
          String? principalPaid,
          String? interestPaid,
          DateTime? date}) =>
      SHGLoanRepayment(
        id: id ?? this.id,
        loanId: loanId ?? this.loanId,
        meetingId: meetingId.present ? meetingId.value : this.meetingId,
        principalPaid: principalPaid ?? this.principalPaid,
        interestPaid: interestPaid ?? this.interestPaid,
        date: date ?? this.date,
      );
  SHGLoanRepayment copyWithCompanion(SHGLoanRepaymentsCompanion data) {
    return SHGLoanRepayment(
      id: data.id.present ? data.id.value : this.id,
      loanId: data.loanId.present ? data.loanId.value : this.loanId,
      meetingId: data.meetingId.present ? data.meetingId.value : this.meetingId,
      principalPaid: data.principalPaid.present
          ? data.principalPaid.value
          : this.principalPaid,
      interestPaid: data.interestPaid.present
          ? data.interestPaid.value
          : this.interestPaid,
      date: data.date.present ? data.date.value : this.date,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SHGLoanRepayment(')
          ..write('id: $id, ')
          ..write('loanId: $loanId, ')
          ..write('meetingId: $meetingId, ')
          ..write('principalPaid: $principalPaid, ')
          ..write('interestPaid: $interestPaid, ')
          ..write('date: $date')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, loanId, meetingId, principalPaid, interestPaid, date);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SHGLoanRepayment &&
          other.id == this.id &&
          other.loanId == this.loanId &&
          other.meetingId == this.meetingId &&
          other.principalPaid == this.principalPaid &&
          other.interestPaid == this.interestPaid &&
          other.date == this.date);
}

class SHGLoanRepaymentsCompanion extends UpdateCompanion<SHGLoanRepayment> {
  final Value<int> id;
  final Value<int> loanId;
  final Value<int?> meetingId;
  final Value<String> principalPaid;
  final Value<String> interestPaid;
  final Value<DateTime> date;
  const SHGLoanRepaymentsCompanion({
    this.id = const Value.absent(),
    this.loanId = const Value.absent(),
    this.meetingId = const Value.absent(),
    this.principalPaid = const Value.absent(),
    this.interestPaid = const Value.absent(),
    this.date = const Value.absent(),
  });
  SHGLoanRepaymentsCompanion.insert({
    this.id = const Value.absent(),
    required int loanId,
    this.meetingId = const Value.absent(),
    required String principalPaid,
    required String interestPaid,
    this.date = const Value.absent(),
  })  : loanId = Value(loanId),
        principalPaid = Value(principalPaid),
        interestPaid = Value(interestPaid);
  static Insertable<SHGLoanRepayment> custom({
    Expression<int>? id,
    Expression<int>? loanId,
    Expression<int>? meetingId,
    Expression<String>? principalPaid,
    Expression<String>? interestPaid,
    Expression<DateTime>? date,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (loanId != null) 'loan_id': loanId,
      if (meetingId != null) 'meeting_id': meetingId,
      if (principalPaid != null) 'principal_paid': principalPaid,
      if (interestPaid != null) 'interest_paid': interestPaid,
      if (date != null) 'date': date,
    });
  }

  SHGLoanRepaymentsCompanion copyWith(
      {Value<int>? id,
      Value<int>? loanId,
      Value<int?>? meetingId,
      Value<String>? principalPaid,
      Value<String>? interestPaid,
      Value<DateTime>? date}) {
    return SHGLoanRepaymentsCompanion(
      id: id ?? this.id,
      loanId: loanId ?? this.loanId,
      meetingId: meetingId ?? this.meetingId,
      principalPaid: principalPaid ?? this.principalPaid,
      interestPaid: interestPaid ?? this.interestPaid,
      date: date ?? this.date,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (loanId.present) {
      map['loan_id'] = Variable<int>(loanId.value);
    }
    if (meetingId.present) {
      map['meeting_id'] = Variable<int>(meetingId.value);
    }
    if (principalPaid.present) {
      map['principal_paid'] = Variable<String>(principalPaid.value);
    }
    if (interestPaid.present) {
      map['interest_paid'] = Variable<String>(interestPaid.value);
    }
    if (date.present) {
      map['date'] = Variable<DateTime>(date.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SHGLoanRepaymentsCompanion(')
          ..write('id: $id, ')
          ..write('loanId: $loanId, ')
          ..write('meetingId: $meetingId, ')
          ..write('principalPaid: $principalPaid, ')
          ..write('interestPaid: $interestPaid, ')
          ..write('date: $date')
          ..write(')'))
        .toString();
  }
}

class $SHGAttendancesTable extends SHGAttendances
    with TableInfo<$SHGAttendancesTable, SHGAttendance> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SHGAttendancesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _meetingIdMeta =
      const VerificationMeta('meetingId');
  @override
  late final GeneratedColumn<int> meetingId = GeneratedColumn<int>(
      'meeting_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES s_h_g_meetings (id) ON DELETE CASCADE'));
  static const VerificationMeta _membershipIdMeta =
      const VerificationMeta('membershipId');
  @override
  late final GeneratedColumn<int> membershipId = GeneratedColumn<int>(
      'membership_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES s_h_g_memberships (id) ON DELETE CASCADE'));
  static const VerificationMeta _isPresentMeta =
      const VerificationMeta('isPresent');
  @override
  late final GeneratedColumn<bool> isPresent = GeneratedColumn<bool>(
      'is_present', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("is_present" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _fineAmountMeta =
      const VerificationMeta('fineAmount');
  @override
  late final GeneratedColumn<double> fineAmount = GeneratedColumn<double>(
      'fine_amount', aliasedName, false,
      type: DriftSqlType.double,
      requiredDuringInsert: false,
      defaultValue: const Constant(0.0));
  @override
  List<GeneratedColumn> get $columns =>
      [id, meetingId, membershipId, isPresent, fineAmount];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 's_h_g_attendances';
  @override
  VerificationContext validateIntegrity(Insertable<SHGAttendance> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('meeting_id')) {
      context.handle(_meetingIdMeta,
          meetingId.isAcceptableOrUnknown(data['meeting_id']!, _meetingIdMeta));
    } else if (isInserting) {
      context.missing(_meetingIdMeta);
    }
    if (data.containsKey('membership_id')) {
      context.handle(
          _membershipIdMeta,
          membershipId.isAcceptableOrUnknown(
              data['membership_id']!, _membershipIdMeta));
    } else if (isInserting) {
      context.missing(_membershipIdMeta);
    }
    if (data.containsKey('is_present')) {
      context.handle(_isPresentMeta,
          isPresent.isAcceptableOrUnknown(data['is_present']!, _isPresentMeta));
    }
    if (data.containsKey('fine_amount')) {
      context.handle(
          _fineAmountMeta,
          fineAmount.isAcceptableOrUnknown(
              data['fine_amount']!, _fineAmountMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SHGAttendance map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SHGAttendance(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      meetingId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}meeting_id'])!,
      membershipId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}membership_id'])!,
      isPresent: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_present'])!,
      fineAmount: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}fine_amount'])!,
    );
  }

  @override
  $SHGAttendancesTable createAlias(String alias) {
    return $SHGAttendancesTable(attachedDatabase, alias);
  }
}

class SHGAttendance extends DataClass implements Insertable<SHGAttendance> {
  final int id;
  final int meetingId;
  final int membershipId;
  final bool isPresent;
  final double fineAmount;
  const SHGAttendance(
      {required this.id,
      required this.meetingId,
      required this.membershipId,
      required this.isPresent,
      required this.fineAmount});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['meeting_id'] = Variable<int>(meetingId);
    map['membership_id'] = Variable<int>(membershipId);
    map['is_present'] = Variable<bool>(isPresent);
    map['fine_amount'] = Variable<double>(fineAmount);
    return map;
  }

  SHGAttendancesCompanion toCompanion(bool nullToAbsent) {
    return SHGAttendancesCompanion(
      id: Value(id),
      meetingId: Value(meetingId),
      membershipId: Value(membershipId),
      isPresent: Value(isPresent),
      fineAmount: Value(fineAmount),
    );
  }

  factory SHGAttendance.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SHGAttendance(
      id: serializer.fromJson<int>(json['id']),
      meetingId: serializer.fromJson<int>(json['meetingId']),
      membershipId: serializer.fromJson<int>(json['membershipId']),
      isPresent: serializer.fromJson<bool>(json['isPresent']),
      fineAmount: serializer.fromJson<double>(json['fineAmount']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'meetingId': serializer.toJson<int>(meetingId),
      'membershipId': serializer.toJson<int>(membershipId),
      'isPresent': serializer.toJson<bool>(isPresent),
      'fineAmount': serializer.toJson<double>(fineAmount),
    };
  }

  SHGAttendance copyWith(
          {int? id,
          int? meetingId,
          int? membershipId,
          bool? isPresent,
          double? fineAmount}) =>
      SHGAttendance(
        id: id ?? this.id,
        meetingId: meetingId ?? this.meetingId,
        membershipId: membershipId ?? this.membershipId,
        isPresent: isPresent ?? this.isPresent,
        fineAmount: fineAmount ?? this.fineAmount,
      );
  SHGAttendance copyWithCompanion(SHGAttendancesCompanion data) {
    return SHGAttendance(
      id: data.id.present ? data.id.value : this.id,
      meetingId: data.meetingId.present ? data.meetingId.value : this.meetingId,
      membershipId: data.membershipId.present
          ? data.membershipId.value
          : this.membershipId,
      isPresent: data.isPresent.present ? data.isPresent.value : this.isPresent,
      fineAmount:
          data.fineAmount.present ? data.fineAmount.value : this.fineAmount,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SHGAttendance(')
          ..write('id: $id, ')
          ..write('meetingId: $meetingId, ')
          ..write('membershipId: $membershipId, ')
          ..write('isPresent: $isPresent, ')
          ..write('fineAmount: $fineAmount')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, meetingId, membershipId, isPresent, fineAmount);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SHGAttendance &&
          other.id == this.id &&
          other.meetingId == this.meetingId &&
          other.membershipId == this.membershipId &&
          other.isPresent == this.isPresent &&
          other.fineAmount == this.fineAmount);
}

class SHGAttendancesCompanion extends UpdateCompanion<SHGAttendance> {
  final Value<int> id;
  final Value<int> meetingId;
  final Value<int> membershipId;
  final Value<bool> isPresent;
  final Value<double> fineAmount;
  const SHGAttendancesCompanion({
    this.id = const Value.absent(),
    this.meetingId = const Value.absent(),
    this.membershipId = const Value.absent(),
    this.isPresent = const Value.absent(),
    this.fineAmount = const Value.absent(),
  });
  SHGAttendancesCompanion.insert({
    this.id = const Value.absent(),
    required int meetingId,
    required int membershipId,
    this.isPresent = const Value.absent(),
    this.fineAmount = const Value.absent(),
  })  : meetingId = Value(meetingId),
        membershipId = Value(membershipId);
  static Insertable<SHGAttendance> custom({
    Expression<int>? id,
    Expression<int>? meetingId,
    Expression<int>? membershipId,
    Expression<bool>? isPresent,
    Expression<double>? fineAmount,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (meetingId != null) 'meeting_id': meetingId,
      if (membershipId != null) 'membership_id': membershipId,
      if (isPresent != null) 'is_present': isPresent,
      if (fineAmount != null) 'fine_amount': fineAmount,
    });
  }

  SHGAttendancesCompanion copyWith(
      {Value<int>? id,
      Value<int>? meetingId,
      Value<int>? membershipId,
      Value<bool>? isPresent,
      Value<double>? fineAmount}) {
    return SHGAttendancesCompanion(
      id: id ?? this.id,
      meetingId: meetingId ?? this.meetingId,
      membershipId: membershipId ?? this.membershipId,
      isPresent: isPresent ?? this.isPresent,
      fineAmount: fineAmount ?? this.fineAmount,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (meetingId.present) {
      map['meeting_id'] = Variable<int>(meetingId.value);
    }
    if (membershipId.present) {
      map['membership_id'] = Variable<int>(membershipId.value);
    }
    if (isPresent.present) {
      map['is_present'] = Variable<bool>(isPresent.value);
    }
    if (fineAmount.present) {
      map['fine_amount'] = Variable<double>(fineAmount.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SHGAttendancesCompanion(')
          ..write('id: $id, ')
          ..write('meetingId: $meetingId, ')
          ..write('membershipId: $membershipId, ')
          ..write('isPresent: $isPresent, ')
          ..write('fineAmount: $fineAmount')
          ..write(')'))
        .toString();
  }
}

class $SHGCashBooksTable extends SHGCashBooks
    with TableInfo<$SHGCashBooksTable, SHGCashBook> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SHGCashBooksTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _groupIdMeta =
      const VerificationMeta('groupId');
  @override
  late final GeneratedColumn<int> groupId = GeneratedColumn<int>(
      'group_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES s_h_g_groups (id) ON DELETE CASCADE'));
  static const VerificationMeta _dateMeta = const VerificationMeta('date');
  @override
  late final GeneratedColumn<DateTime> date = GeneratedColumn<DateTime>(
      'date', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _transactionTypeMeta =
      const VerificationMeta('transactionType');
  @override
  late final GeneratedColumn<String> transactionType = GeneratedColumn<String>(
      'transaction_type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _categoryMeta =
      const VerificationMeta('category');
  @override
  late final GeneratedColumn<String> category = GeneratedColumn<String>(
      'category', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _amountMeta = const VerificationMeta('amount');
  @override
  late final GeneratedColumn<double> amount = GeneratedColumn<double>(
      'amount', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _descriptionMeta =
      const VerificationMeta('description');
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
      'description', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns =>
      [id, groupId, date, transactionType, category, amount, description];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 's_h_g_cash_books';
  @override
  VerificationContext validateIntegrity(Insertable<SHGCashBook> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('group_id')) {
      context.handle(_groupIdMeta,
          groupId.isAcceptableOrUnknown(data['group_id']!, _groupIdMeta));
    } else if (isInserting) {
      context.missing(_groupIdMeta);
    }
    if (data.containsKey('date')) {
      context.handle(
          _dateMeta, date.isAcceptableOrUnknown(data['date']!, _dateMeta));
    }
    if (data.containsKey('transaction_type')) {
      context.handle(
          _transactionTypeMeta,
          transactionType.isAcceptableOrUnknown(
              data['transaction_type']!, _transactionTypeMeta));
    } else if (isInserting) {
      context.missing(_transactionTypeMeta);
    }
    if (data.containsKey('category')) {
      context.handle(_categoryMeta,
          category.isAcceptableOrUnknown(data['category']!, _categoryMeta));
    } else if (isInserting) {
      context.missing(_categoryMeta);
    }
    if (data.containsKey('amount')) {
      context.handle(_amountMeta,
          amount.isAcceptableOrUnknown(data['amount']!, _amountMeta));
    } else if (isInserting) {
      context.missing(_amountMeta);
    }
    if (data.containsKey('description')) {
      context.handle(
          _descriptionMeta,
          description.isAcceptableOrUnknown(
              data['description']!, _descriptionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SHGCashBook map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SHGCashBook(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      groupId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}group_id'])!,
      date: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}date'])!,
      transactionType: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}transaction_type'])!,
      category: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}category'])!,
      amount: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}amount'])!,
      description: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}description']),
    );
  }

  @override
  $SHGCashBooksTable createAlias(String alias) {
    return $SHGCashBooksTable(attachedDatabase, alias);
  }
}

class SHGCashBook extends DataClass implements Insertable<SHGCashBook> {
  final int id;
  final int groupId;
  final DateTime date;
  final String transactionType;
  final String category;
  final double amount;
  final String? description;
  const SHGCashBook(
      {required this.id,
      required this.groupId,
      required this.date,
      required this.transactionType,
      required this.category,
      required this.amount,
      this.description});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['group_id'] = Variable<int>(groupId);
    map['date'] = Variable<DateTime>(date);
    map['transaction_type'] = Variable<String>(transactionType);
    map['category'] = Variable<String>(category);
    map['amount'] = Variable<double>(amount);
    if (!nullToAbsent || description != null) {
      map['description'] = Variable<String>(description);
    }
    return map;
  }

  SHGCashBooksCompanion toCompanion(bool nullToAbsent) {
    return SHGCashBooksCompanion(
      id: Value(id),
      groupId: Value(groupId),
      date: Value(date),
      transactionType: Value(transactionType),
      category: Value(category),
      amount: Value(amount),
      description: description == null && nullToAbsent
          ? const Value.absent()
          : Value(description),
    );
  }

  factory SHGCashBook.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SHGCashBook(
      id: serializer.fromJson<int>(json['id']),
      groupId: serializer.fromJson<int>(json['groupId']),
      date: serializer.fromJson<DateTime>(json['date']),
      transactionType: serializer.fromJson<String>(json['transactionType']),
      category: serializer.fromJson<String>(json['category']),
      amount: serializer.fromJson<double>(json['amount']),
      description: serializer.fromJson<String?>(json['description']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'groupId': serializer.toJson<int>(groupId),
      'date': serializer.toJson<DateTime>(date),
      'transactionType': serializer.toJson<String>(transactionType),
      'category': serializer.toJson<String>(category),
      'amount': serializer.toJson<double>(amount),
      'description': serializer.toJson<String?>(description),
    };
  }

  SHGCashBook copyWith(
          {int? id,
          int? groupId,
          DateTime? date,
          String? transactionType,
          String? category,
          double? amount,
          Value<String?> description = const Value.absent()}) =>
      SHGCashBook(
        id: id ?? this.id,
        groupId: groupId ?? this.groupId,
        date: date ?? this.date,
        transactionType: transactionType ?? this.transactionType,
        category: category ?? this.category,
        amount: amount ?? this.amount,
        description: description.present ? description.value : this.description,
      );
  SHGCashBook copyWithCompanion(SHGCashBooksCompanion data) {
    return SHGCashBook(
      id: data.id.present ? data.id.value : this.id,
      groupId: data.groupId.present ? data.groupId.value : this.groupId,
      date: data.date.present ? data.date.value : this.date,
      transactionType: data.transactionType.present
          ? data.transactionType.value
          : this.transactionType,
      category: data.category.present ? data.category.value : this.category,
      amount: data.amount.present ? data.amount.value : this.amount,
      description:
          data.description.present ? data.description.value : this.description,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SHGCashBook(')
          ..write('id: $id, ')
          ..write('groupId: $groupId, ')
          ..write('date: $date, ')
          ..write('transactionType: $transactionType, ')
          ..write('category: $category, ')
          ..write('amount: $amount, ')
          ..write('description: $description')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id, groupId, date, transactionType, category, amount, description);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SHGCashBook &&
          other.id == this.id &&
          other.groupId == this.groupId &&
          other.date == this.date &&
          other.transactionType == this.transactionType &&
          other.category == this.category &&
          other.amount == this.amount &&
          other.description == this.description);
}

class SHGCashBooksCompanion extends UpdateCompanion<SHGCashBook> {
  final Value<int> id;
  final Value<int> groupId;
  final Value<DateTime> date;
  final Value<String> transactionType;
  final Value<String> category;
  final Value<double> amount;
  final Value<String?> description;
  const SHGCashBooksCompanion({
    this.id = const Value.absent(),
    this.groupId = const Value.absent(),
    this.date = const Value.absent(),
    this.transactionType = const Value.absent(),
    this.category = const Value.absent(),
    this.amount = const Value.absent(),
    this.description = const Value.absent(),
  });
  SHGCashBooksCompanion.insert({
    this.id = const Value.absent(),
    required int groupId,
    this.date = const Value.absent(),
    required String transactionType,
    required String category,
    required double amount,
    this.description = const Value.absent(),
  })  : groupId = Value(groupId),
        transactionType = Value(transactionType),
        category = Value(category),
        amount = Value(amount);
  static Insertable<SHGCashBook> custom({
    Expression<int>? id,
    Expression<int>? groupId,
    Expression<DateTime>? date,
    Expression<String>? transactionType,
    Expression<String>? category,
    Expression<double>? amount,
    Expression<String>? description,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (groupId != null) 'group_id': groupId,
      if (date != null) 'date': date,
      if (transactionType != null) 'transaction_type': transactionType,
      if (category != null) 'category': category,
      if (amount != null) 'amount': amount,
      if (description != null) 'description': description,
    });
  }

  SHGCashBooksCompanion copyWith(
      {Value<int>? id,
      Value<int>? groupId,
      Value<DateTime>? date,
      Value<String>? transactionType,
      Value<String>? category,
      Value<double>? amount,
      Value<String?>? description}) {
    return SHGCashBooksCompanion(
      id: id ?? this.id,
      groupId: groupId ?? this.groupId,
      date: date ?? this.date,
      transactionType: transactionType ?? this.transactionType,
      category: category ?? this.category,
      amount: amount ?? this.amount,
      description: description ?? this.description,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (groupId.present) {
      map['group_id'] = Variable<int>(groupId.value);
    }
    if (date.present) {
      map['date'] = Variable<DateTime>(date.value);
    }
    if (transactionType.present) {
      map['transaction_type'] = Variable<String>(transactionType.value);
    }
    if (category.present) {
      map['category'] = Variable<String>(category.value);
    }
    if (amount.present) {
      map['amount'] = Variable<double>(amount.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SHGCashBooksCompanion(')
          ..write('id: $id, ')
          ..write('groupId: $groupId, ')
          ..write('date: $date, ')
          ..write('transactionType: $transactionType, ')
          ..write('category: $category, ')
          ..write('amount: $amount, ')
          ..write('description: $description')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $MembersTable members = $MembersTable(this);
  late final $GroupsTable groups = $GroupsTable(this);
  late final $MembershipsTable memberships = $MembershipsTable(this);
  late final $RoundsTable rounds = $RoundsTable(this);
  late final $PaymentsTable payments = $PaymentsTable(this);
  late final $AdminSettingsTable adminSettings = $AdminSettingsTable(this);
  late final $AuditLogsTable auditLogs = $AuditLogsTable(this);
  late final $SHGGroupsTable sHGGroups = $SHGGroupsTable(this);
  late final $SHGMembershipsTable sHGMemberships = $SHGMembershipsTable(this);
  late final $SHGMeetingsTable sHGMeetings = $SHGMeetingsTable(this);
  late final $SHGSavingsTable sHGSavings = $SHGSavingsTable(this);
  late final $SHGLoansTable sHGLoans = $SHGLoansTable(this);
  late final $SHGLoanRepaymentsTable sHGLoanRepayments =
      $SHGLoanRepaymentsTable(this);
  late final $SHGAttendancesTable sHGAttendances = $SHGAttendancesTable(this);
  late final $SHGCashBooksTable sHGCashBooks = $SHGCashBooksTable(this);
  late final Index idxMemberPhone = Index(
      'idx_member_phone', 'CREATE INDEX idx_member_phone ON members (phone)');
  late final Index idxPaymentRound = Index('idx_payment_round',
      'CREATE INDEX idx_payment_round ON payments (round_id)');
  late final AppDao appDao = AppDao(this as AppDatabase);
  late final SHGDao sHGDao = SHGDao(this as AppDatabase);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
        members,
        groups,
        memberships,
        rounds,
        payments,
        adminSettings,
        auditLogs,
        sHGGroups,
        sHGMemberships,
        sHGMeetings,
        sHGSavings,
        sHGLoans,
        sHGLoanRepayments,
        sHGAttendances,
        sHGCashBooks,
        idxMemberPhone,
        idxPaymentRound
      ];
  @override
  StreamQueryUpdateRules get streamUpdateRules => const StreamQueryUpdateRules(
        [
          WritePropagation(
            on: TableUpdateQuery.onTableName('members',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('memberships', kind: UpdateKind.delete),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('groups',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('memberships', kind: UpdateKind.delete),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('groups',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('rounds', kind: UpdateKind.delete),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('members',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('rounds', kind: UpdateKind.update),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('members',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('rounds', kind: UpdateKind.update),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('members',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('rounds', kind: UpdateKind.update),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('memberships',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('payments', kind: UpdateKind.delete),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('rounds',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('payments', kind: UpdateKind.delete),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('members',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('s_h_g_memberships', kind: UpdateKind.delete),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('s_h_g_groups',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('s_h_g_memberships', kind: UpdateKind.delete),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('s_h_g_groups',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('s_h_g_meetings', kind: UpdateKind.delete),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('s_h_g_memberships',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('s_h_g_savings', kind: UpdateKind.delete),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('s_h_g_meetings',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('s_h_g_savings', kind: UpdateKind.update),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('s_h_g_memberships',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('s_h_g_loans', kind: UpdateKind.delete),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('s_h_g_loans',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('s_h_g_loan_repayments', kind: UpdateKind.delete),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('s_h_g_meetings',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('s_h_g_loan_repayments', kind: UpdateKind.update),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('s_h_g_meetings',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('s_h_g_attendances', kind: UpdateKind.delete),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('s_h_g_memberships',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('s_h_g_attendances', kind: UpdateKind.delete),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('s_h_g_groups',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('s_h_g_cash_books', kind: UpdateKind.delete),
            ],
          ),
        ],
      );
}

typedef $$MembersTableCreateCompanionBuilder = MembersCompanion Function({
  Value<int> id,
  required String name,
  required String phone,
  Value<String?> whatsapp,
  Value<String?> address,
  Value<String?> occupation,
  Value<DateTime> joiningDate,
  Value<String> status,
  Value<String?> photoPath,
  Value<double?> trustScore,
  Value<String?> pin,
});
typedef $$MembersTableUpdateCompanionBuilder = MembersCompanion Function({
  Value<int> id,
  Value<String> name,
  Value<String> phone,
  Value<String?> whatsapp,
  Value<String?> address,
  Value<String?> occupation,
  Value<DateTime> joiningDate,
  Value<String> status,
  Value<String?> photoPath,
  Value<double?> trustScore,
  Value<String?> pin,
});

final class $$MembersTableReferences
    extends BaseReferences<_$AppDatabase, $MembersTable, Member> {
  $$MembersTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static MultiTypedResultKey<$MembershipsTable, List<Membership>>
      _membershipsRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.memberships,
              aliasName: 'members__id__memberships__member_id');

  $$MembershipsTableProcessedTableManager get membershipsRefs {
    final manager = $$MembershipsTableTableManager($_db, $_db.memberships)
        .filter((f) => f.memberId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_membershipsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }

  static MultiTypedResultKey<$SHGMembershipsTable, List<SHGMembership>>
      _sHGMembershipsRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.sHGMemberships,
              aliasName: 'members__id__s_h_g_memberships__member_id');

  $$SHGMembershipsTableProcessedTableManager get sHGMembershipsRefs {
    final manager = $$SHGMembershipsTableTableManager($_db, $_db.sHGMemberships)
        .filter((f) => f.memberId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_sHGMembershipsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }
}

class $$MembersTableFilterComposer
    extends Composer<_$AppDatabase, $MembersTable> {
  $$MembersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get phone => $composableBuilder(
      column: $table.phone, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get whatsapp => $composableBuilder(
      column: $table.whatsapp, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get address => $composableBuilder(
      column: $table.address, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get occupation => $composableBuilder(
      column: $table.occupation, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get joiningDate => $composableBuilder(
      column: $table.joiningDate, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get photoPath => $composableBuilder(
      column: $table.photoPath, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get trustScore => $composableBuilder(
      column: $table.trustScore, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get pin => $composableBuilder(
      column: $table.pin, builder: (column) => ColumnFilters(column));

  Expression<bool> membershipsRefs(
      Expression<bool> Function($$MembershipsTableFilterComposer f) f) {
    final $$MembershipsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.memberships,
        getReferencedColumn: (t) => t.memberId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembershipsTableFilterComposer(
              $db: $db,
              $table: $db.memberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<bool> sHGMembershipsRefs(
      Expression<bool> Function($$SHGMembershipsTableFilterComposer f) f) {
    final $$SHGMembershipsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGMemberships,
        getReferencedColumn: (t) => t.memberId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMembershipsTableFilterComposer(
              $db: $db,
              $table: $db.sHGMemberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$MembersTableOrderingComposer
    extends Composer<_$AppDatabase, $MembersTable> {
  $$MembersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get phone => $composableBuilder(
      column: $table.phone, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get whatsapp => $composableBuilder(
      column: $table.whatsapp, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get address => $composableBuilder(
      column: $table.address, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get occupation => $composableBuilder(
      column: $table.occupation, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get joiningDate => $composableBuilder(
      column: $table.joiningDate, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get photoPath => $composableBuilder(
      column: $table.photoPath, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get trustScore => $composableBuilder(
      column: $table.trustScore, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get pin => $composableBuilder(
      column: $table.pin, builder: (column) => ColumnOrderings(column));
}

class $$MembersTableAnnotationComposer
    extends Composer<_$AppDatabase, $MembersTable> {
  $$MembersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get phone =>
      $composableBuilder(column: $table.phone, builder: (column) => column);

  GeneratedColumn<String> get whatsapp =>
      $composableBuilder(column: $table.whatsapp, builder: (column) => column);

  GeneratedColumn<String> get address =>
      $composableBuilder(column: $table.address, builder: (column) => column);

  GeneratedColumn<String> get occupation => $composableBuilder(
      column: $table.occupation, builder: (column) => column);

  GeneratedColumn<DateTime> get joiningDate => $composableBuilder(
      column: $table.joiningDate, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get photoPath =>
      $composableBuilder(column: $table.photoPath, builder: (column) => column);

  GeneratedColumn<double> get trustScore => $composableBuilder(
      column: $table.trustScore, builder: (column) => column);

  GeneratedColumn<String> get pin =>
      $composableBuilder(column: $table.pin, builder: (column) => column);

  Expression<T> membershipsRefs<T extends Object>(
      Expression<T> Function($$MembershipsTableAnnotationComposer a) f) {
    final $$MembershipsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.memberships,
        getReferencedColumn: (t) => t.memberId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembershipsTableAnnotationComposer(
              $db: $db,
              $table: $db.memberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<T> sHGMembershipsRefs<T extends Object>(
      Expression<T> Function($$SHGMembershipsTableAnnotationComposer a) f) {
    final $$SHGMembershipsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGMemberships,
        getReferencedColumn: (t) => t.memberId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMembershipsTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGMemberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$MembersTableTableManager extends RootTableManager<
    _$AppDatabase,
    $MembersTable,
    Member,
    $$MembersTableFilterComposer,
    $$MembersTableOrderingComposer,
    $$MembersTableAnnotationComposer,
    $$MembersTableCreateCompanionBuilder,
    $$MembersTableUpdateCompanionBuilder,
    (Member, $$MembersTableReferences),
    Member,
    PrefetchHooks Function({bool membershipsRefs, bool sHGMembershipsRefs})> {
  $$MembersTableTableManager(_$AppDatabase db, $MembersTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$MembersTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$MembersTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$MembersTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String> phone = const Value.absent(),
            Value<String?> whatsapp = const Value.absent(),
            Value<String?> address = const Value.absent(),
            Value<String?> occupation = const Value.absent(),
            Value<DateTime> joiningDate = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<String?> photoPath = const Value.absent(),
            Value<double?> trustScore = const Value.absent(),
            Value<String?> pin = const Value.absent(),
          }) =>
              MembersCompanion(
            id: id,
            name: name,
            phone: phone,
            whatsapp: whatsapp,
            address: address,
            occupation: occupation,
            joiningDate: joiningDate,
            status: status,
            photoPath: photoPath,
            trustScore: trustScore,
            pin: pin,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required String name,
            required String phone,
            Value<String?> whatsapp = const Value.absent(),
            Value<String?> address = const Value.absent(),
            Value<String?> occupation = const Value.absent(),
            Value<DateTime> joiningDate = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<String?> photoPath = const Value.absent(),
            Value<double?> trustScore = const Value.absent(),
            Value<String?> pin = const Value.absent(),
          }) =>
              MembersCompanion.insert(
            id: id,
            name: name,
            phone: phone,
            whatsapp: whatsapp,
            address: address,
            occupation: occupation,
            joiningDate: joiningDate,
            status: status,
            photoPath: photoPath,
            trustScore: trustScore,
            pin: pin,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) =>
                  (e.readTable(table), $$MembersTableReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: (
              {membershipsRefs = false, sHGMembershipsRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [
                if (membershipsRefs) db.memberships,
                if (sHGMembershipsRefs) db.sHGMemberships
              ],
              addJoins: null,
              getPrefetchedDataCallback: (items) async {
                return [
                  if (membershipsRefs)
                    await $_getPrefetchedData<Member, $MembersTable,
                            Membership>(
                        currentTable: table,
                        referencedTable:
                            $$MembersTableReferences._membershipsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$MembersTableReferences(db, table, p0)
                                .membershipsRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.memberId == item.id),
                        typedResults: items),
                  if (sHGMembershipsRefs)
                    await $_getPrefetchedData<Member, $MembersTable,
                            SHGMembership>(
                        currentTable: table,
                        referencedTable: $$MembersTableReferences
                            ._sHGMembershipsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$MembersTableReferences(db, table, p0)
                                .sHGMembershipsRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.memberId == item.id),
                        typedResults: items)
                ];
              },
            );
          },
        ));
}

typedef $$MembersTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $MembersTable,
    Member,
    $$MembersTableFilterComposer,
    $$MembersTableOrderingComposer,
    $$MembersTableAnnotationComposer,
    $$MembersTableCreateCompanionBuilder,
    $$MembersTableUpdateCompanionBuilder,
    (Member, $$MembersTableReferences),
    Member,
    PrefetchHooks Function({bool membershipsRefs, bool sHGMembershipsRefs})>;
typedef $$GroupsTableCreateCompanionBuilder = GroupsCompanion Function({
  Value<int> id,
  required String name,
  required double chitValue,
  required int totalMonths,
  required double monthlyContribution,
  required DateTime startDate,
  Value<String> status,
  Value<String?> whatsappGroupLink,
  Value<bool> isDeleted,
  Value<int> paymentDueDate,
});
typedef $$GroupsTableUpdateCompanionBuilder = GroupsCompanion Function({
  Value<int> id,
  Value<String> name,
  Value<double> chitValue,
  Value<int> totalMonths,
  Value<double> monthlyContribution,
  Value<DateTime> startDate,
  Value<String> status,
  Value<String?> whatsappGroupLink,
  Value<bool> isDeleted,
  Value<int> paymentDueDate,
});

final class $$GroupsTableReferences
    extends BaseReferences<_$AppDatabase, $GroupsTable, Group> {
  $$GroupsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static MultiTypedResultKey<$MembershipsTable, List<Membership>>
      _membershipsRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.memberships,
              aliasName: 'groups__id__memberships__group_id');

  $$MembershipsTableProcessedTableManager get membershipsRefs {
    final manager = $$MembershipsTableTableManager($_db, $_db.memberships)
        .filter((f) => f.groupId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_membershipsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }

  static MultiTypedResultKey<$RoundsTable, List<Round>> _roundsRefsTable(
          _$AppDatabase db) =>
      MultiTypedResultKey.fromTable(db.rounds,
          aliasName: 'groups__id__rounds__group_id');

  $$RoundsTableProcessedTableManager get roundsRefs {
    final manager = $$RoundsTableTableManager($_db, $_db.rounds)
        .filter((f) => f.groupId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_roundsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }
}

class $$GroupsTableFilterComposer
    extends Composer<_$AppDatabase, $GroupsTable> {
  $$GroupsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get chitValue => $composableBuilder(
      column: $table.chitValue, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get totalMonths => $composableBuilder(
      column: $table.totalMonths, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get monthlyContribution => $composableBuilder(
      column: $table.monthlyContribution,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get startDate => $composableBuilder(
      column: $table.startDate, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get whatsappGroupLink => $composableBuilder(
      column: $table.whatsappGroupLink,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get isDeleted => $composableBuilder(
      column: $table.isDeleted, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get paymentDueDate => $composableBuilder(
      column: $table.paymentDueDate,
      builder: (column) => ColumnFilters(column));

  Expression<bool> membershipsRefs(
      Expression<bool> Function($$MembershipsTableFilterComposer f) f) {
    final $$MembershipsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.memberships,
        getReferencedColumn: (t) => t.groupId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembershipsTableFilterComposer(
              $db: $db,
              $table: $db.memberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<bool> roundsRefs(
      Expression<bool> Function($$RoundsTableFilterComposer f) f) {
    final $$RoundsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.rounds,
        getReferencedColumn: (t) => t.groupId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$RoundsTableFilterComposer(
              $db: $db,
              $table: $db.rounds,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$GroupsTableOrderingComposer
    extends Composer<_$AppDatabase, $GroupsTable> {
  $$GroupsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get chitValue => $composableBuilder(
      column: $table.chitValue, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get totalMonths => $composableBuilder(
      column: $table.totalMonths, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get monthlyContribution => $composableBuilder(
      column: $table.monthlyContribution,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get startDate => $composableBuilder(
      column: $table.startDate, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get whatsappGroupLink => $composableBuilder(
      column: $table.whatsappGroupLink,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get isDeleted => $composableBuilder(
      column: $table.isDeleted, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get paymentDueDate => $composableBuilder(
      column: $table.paymentDueDate,
      builder: (column) => ColumnOrderings(column));
}

class $$GroupsTableAnnotationComposer
    extends Composer<_$AppDatabase, $GroupsTable> {
  $$GroupsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<double> get chitValue =>
      $composableBuilder(column: $table.chitValue, builder: (column) => column);

  GeneratedColumn<int> get totalMonths => $composableBuilder(
      column: $table.totalMonths, builder: (column) => column);

  GeneratedColumn<double> get monthlyContribution => $composableBuilder(
      column: $table.monthlyContribution, builder: (column) => column);

  GeneratedColumn<DateTime> get startDate =>
      $composableBuilder(column: $table.startDate, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get whatsappGroupLink => $composableBuilder(
      column: $table.whatsappGroupLink, builder: (column) => column);

  GeneratedColumn<bool> get isDeleted =>
      $composableBuilder(column: $table.isDeleted, builder: (column) => column);

  GeneratedColumn<int> get paymentDueDate => $composableBuilder(
      column: $table.paymentDueDate, builder: (column) => column);

  Expression<T> membershipsRefs<T extends Object>(
      Expression<T> Function($$MembershipsTableAnnotationComposer a) f) {
    final $$MembershipsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.memberships,
        getReferencedColumn: (t) => t.groupId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembershipsTableAnnotationComposer(
              $db: $db,
              $table: $db.memberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<T> roundsRefs<T extends Object>(
      Expression<T> Function($$RoundsTableAnnotationComposer a) f) {
    final $$RoundsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.rounds,
        getReferencedColumn: (t) => t.groupId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$RoundsTableAnnotationComposer(
              $db: $db,
              $table: $db.rounds,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$GroupsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $GroupsTable,
    Group,
    $$GroupsTableFilterComposer,
    $$GroupsTableOrderingComposer,
    $$GroupsTableAnnotationComposer,
    $$GroupsTableCreateCompanionBuilder,
    $$GroupsTableUpdateCompanionBuilder,
    (Group, $$GroupsTableReferences),
    Group,
    PrefetchHooks Function({bool membershipsRefs, bool roundsRefs})> {
  $$GroupsTableTableManager(_$AppDatabase db, $GroupsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$GroupsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$GroupsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$GroupsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<double> chitValue = const Value.absent(),
            Value<int> totalMonths = const Value.absent(),
            Value<double> monthlyContribution = const Value.absent(),
            Value<DateTime> startDate = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<String?> whatsappGroupLink = const Value.absent(),
            Value<bool> isDeleted = const Value.absent(),
            Value<int> paymentDueDate = const Value.absent(),
          }) =>
              GroupsCompanion(
            id: id,
            name: name,
            chitValue: chitValue,
            totalMonths: totalMonths,
            monthlyContribution: monthlyContribution,
            startDate: startDate,
            status: status,
            whatsappGroupLink: whatsappGroupLink,
            isDeleted: isDeleted,
            paymentDueDate: paymentDueDate,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required String name,
            required double chitValue,
            required int totalMonths,
            required double monthlyContribution,
            required DateTime startDate,
            Value<String> status = const Value.absent(),
            Value<String?> whatsappGroupLink = const Value.absent(),
            Value<bool> isDeleted = const Value.absent(),
            Value<int> paymentDueDate = const Value.absent(),
          }) =>
              GroupsCompanion.insert(
            id: id,
            name: name,
            chitValue: chitValue,
            totalMonths: totalMonths,
            monthlyContribution: monthlyContribution,
            startDate: startDate,
            status: status,
            whatsappGroupLink: whatsappGroupLink,
            isDeleted: isDeleted,
            paymentDueDate: paymentDueDate,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) =>
                  (e.readTable(table), $$GroupsTableReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: (
              {membershipsRefs = false, roundsRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [
                if (membershipsRefs) db.memberships,
                if (roundsRefs) db.rounds
              ],
              addJoins: null,
              getPrefetchedDataCallback: (items) async {
                return [
                  if (membershipsRefs)
                    await $_getPrefetchedData<Group, $GroupsTable, Membership>(
                        currentTable: table,
                        referencedTable:
                            $$GroupsTableReferences._membershipsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$GroupsTableReferences(db, table, p0)
                                .membershipsRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.groupId == item.id),
                        typedResults: items),
                  if (roundsRefs)
                    await $_getPrefetchedData<Group, $GroupsTable, Round>(
                        currentTable: table,
                        referencedTable:
                            $$GroupsTableReferences._roundsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$GroupsTableReferences(db, table, p0).roundsRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.groupId == item.id),
                        typedResults: items)
                ];
              },
            );
          },
        ));
}

typedef $$GroupsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $GroupsTable,
    Group,
    $$GroupsTableFilterComposer,
    $$GroupsTableOrderingComposer,
    $$GroupsTableAnnotationComposer,
    $$GroupsTableCreateCompanionBuilder,
    $$GroupsTableUpdateCompanionBuilder,
    (Group, $$GroupsTableReferences),
    Group,
    PrefetchHooks Function({bool membershipsRefs, bool roundsRefs})>;
typedef $$MembershipsTableCreateCompanionBuilder = MembershipsCompanion
    Function({
  Value<int> id,
  required int memberId,
  required int groupId,
  Value<double> installmentsCount,
  Value<DateTime> joinedAt,
});
typedef $$MembershipsTableUpdateCompanionBuilder = MembershipsCompanion
    Function({
  Value<int> id,
  Value<int> memberId,
  Value<int> groupId,
  Value<double> installmentsCount,
  Value<DateTime> joinedAt,
});

final class $$MembershipsTableReferences
    extends BaseReferences<_$AppDatabase, $MembershipsTable, Membership> {
  $$MembershipsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $MembersTable _memberIdTable(_$AppDatabase db) =>
      db.members.createAlias('memberships__member_id__members__id');

  $$MembersTableProcessedTableManager get memberId {
    final $_column = $_itemColumn<int>('member_id')!;

    final manager = $$MembersTableTableManager($_db, $_db.members)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_memberIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static $GroupsTable _groupIdTable(_$AppDatabase db) =>
      db.groups.createAlias('memberships__group_id__groups__id');

  $$GroupsTableProcessedTableManager get groupId {
    final $_column = $_itemColumn<int>('group_id')!;

    final manager = $$GroupsTableTableManager($_db, $_db.groups)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_groupIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static MultiTypedResultKey<$PaymentsTable, List<Payment>> _paymentsRefsTable(
          _$AppDatabase db) =>
      MultiTypedResultKey.fromTable(db.payments,
          aliasName: 'memberships__id__payments__membership_id');

  $$PaymentsTableProcessedTableManager get paymentsRefs {
    final manager = $$PaymentsTableTableManager($_db, $_db.payments)
        .filter((f) => f.membershipId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_paymentsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }
}

class $$MembershipsTableFilterComposer
    extends Composer<_$AppDatabase, $MembershipsTable> {
  $$MembershipsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get installmentsCount => $composableBuilder(
      column: $table.installmentsCount,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get joinedAt => $composableBuilder(
      column: $table.joinedAt, builder: (column) => ColumnFilters(column));

  $$MembersTableFilterComposer get memberId {
    final $$MembersTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.memberId,
        referencedTable: $db.members,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembersTableFilterComposer(
              $db: $db,
              $table: $db.members,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$GroupsTableFilterComposer get groupId {
    final $$GroupsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.groupId,
        referencedTable: $db.groups,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$GroupsTableFilterComposer(
              $db: $db,
              $table: $db.groups,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  Expression<bool> paymentsRefs(
      Expression<bool> Function($$PaymentsTableFilterComposer f) f) {
    final $$PaymentsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.payments,
        getReferencedColumn: (t) => t.membershipId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$PaymentsTableFilterComposer(
              $db: $db,
              $table: $db.payments,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$MembershipsTableOrderingComposer
    extends Composer<_$AppDatabase, $MembershipsTable> {
  $$MembershipsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get installmentsCount => $composableBuilder(
      column: $table.installmentsCount,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get joinedAt => $composableBuilder(
      column: $table.joinedAt, builder: (column) => ColumnOrderings(column));

  $$MembersTableOrderingComposer get memberId {
    final $$MembersTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.memberId,
        referencedTable: $db.members,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembersTableOrderingComposer(
              $db: $db,
              $table: $db.members,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$GroupsTableOrderingComposer get groupId {
    final $$GroupsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.groupId,
        referencedTable: $db.groups,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$GroupsTableOrderingComposer(
              $db: $db,
              $table: $db.groups,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$MembershipsTableAnnotationComposer
    extends Composer<_$AppDatabase, $MembershipsTable> {
  $$MembershipsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<double> get installmentsCount => $composableBuilder(
      column: $table.installmentsCount, builder: (column) => column);

  GeneratedColumn<DateTime> get joinedAt =>
      $composableBuilder(column: $table.joinedAt, builder: (column) => column);

  $$MembersTableAnnotationComposer get memberId {
    final $$MembersTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.memberId,
        referencedTable: $db.members,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembersTableAnnotationComposer(
              $db: $db,
              $table: $db.members,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$GroupsTableAnnotationComposer get groupId {
    final $$GroupsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.groupId,
        referencedTable: $db.groups,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$GroupsTableAnnotationComposer(
              $db: $db,
              $table: $db.groups,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  Expression<T> paymentsRefs<T extends Object>(
      Expression<T> Function($$PaymentsTableAnnotationComposer a) f) {
    final $$PaymentsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.payments,
        getReferencedColumn: (t) => t.membershipId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$PaymentsTableAnnotationComposer(
              $db: $db,
              $table: $db.payments,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$MembershipsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $MembershipsTable,
    Membership,
    $$MembershipsTableFilterComposer,
    $$MembershipsTableOrderingComposer,
    $$MembershipsTableAnnotationComposer,
    $$MembershipsTableCreateCompanionBuilder,
    $$MembershipsTableUpdateCompanionBuilder,
    (Membership, $$MembershipsTableReferences),
    Membership,
    PrefetchHooks Function({bool memberId, bool groupId, bool paymentsRefs})> {
  $$MembershipsTableTableManager(_$AppDatabase db, $MembershipsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$MembershipsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$MembershipsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$MembershipsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int> memberId = const Value.absent(),
            Value<int> groupId = const Value.absent(),
            Value<double> installmentsCount = const Value.absent(),
            Value<DateTime> joinedAt = const Value.absent(),
          }) =>
              MembershipsCompanion(
            id: id,
            memberId: memberId,
            groupId: groupId,
            installmentsCount: installmentsCount,
            joinedAt: joinedAt,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required int memberId,
            required int groupId,
            Value<double> installmentsCount = const Value.absent(),
            Value<DateTime> joinedAt = const Value.absent(),
          }) =>
              MembershipsCompanion.insert(
            id: id,
            memberId: memberId,
            groupId: groupId,
            installmentsCount: installmentsCount,
            joinedAt: joinedAt,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable(table),
                    $$MembershipsTableReferences(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: (
              {memberId = false, groupId = false, paymentsRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [if (paymentsRefs) db.payments],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (memberId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.memberId,
                    referencedTable:
                        $$MembershipsTableReferences._memberIdTable(db),
                    referencedColumn:
                        $$MembershipsTableReferences._memberIdTable(db).id,
                  ) as T;
                }
                if (groupId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.groupId,
                    referencedTable:
                        $$MembershipsTableReferences._groupIdTable(db),
                    referencedColumn:
                        $$MembershipsTableReferences._groupIdTable(db).id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [
                  if (paymentsRefs)
                    await $_getPrefetchedData<Membership, $MembershipsTable,
                            Payment>(
                        currentTable: table,
                        referencedTable:
                            $$MembershipsTableReferences._paymentsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$MembershipsTableReferences(db, table, p0)
                                .paymentsRefs,
                        referencedItemsForCurrentItem:
                            (item, referencedItems) => referencedItems
                                .where((e) => e.membershipId == item.id),
                        typedResults: items)
                ];
              },
            );
          },
        ));
}

typedef $$MembershipsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $MembershipsTable,
    Membership,
    $$MembershipsTableFilterComposer,
    $$MembershipsTableOrderingComposer,
    $$MembershipsTableAnnotationComposer,
    $$MembershipsTableCreateCompanionBuilder,
    $$MembershipsTableUpdateCompanionBuilder,
    (Membership, $$MembershipsTableReferences),
    Membership,
    PrefetchHooks Function({bool memberId, bool groupId, bool paymentsRefs})>;
typedef $$RoundsTableCreateCompanionBuilder = RoundsCompanion Function({
  Value<int> id,
  required int groupId,
  required int roundNumber,
  required int month,
  required int year,
  Value<double?> bidAmount,
  Value<int?> winnerMemberId,
  Value<double?> foremanCommission,
  Value<double?> dividendDistributed,
  Value<String> payoutStatus,
  Value<DateTime?> payoutDate,
  Value<String?> guarantor1Name,
  Value<String?> guarantor1Phone,
  Value<String?> guarantor2Name,
  Value<String?> guarantor2Phone,
  Value<int?> guarantorMemberId,
  Value<double?> winnerPaid,
  Value<double?> winnerBalance,
  Value<double?> winnerLeft,
  Value<String?> winnerPaymentMode,
  Value<String?> winnerRemarks,
  Value<String?> hijriDate,
  Value<int?> exchangedToMemberId,
  Value<String?> exchangeNote,
});
typedef $$RoundsTableUpdateCompanionBuilder = RoundsCompanion Function({
  Value<int> id,
  Value<int> groupId,
  Value<int> roundNumber,
  Value<int> month,
  Value<int> year,
  Value<double?> bidAmount,
  Value<int?> winnerMemberId,
  Value<double?> foremanCommission,
  Value<double?> dividendDistributed,
  Value<String> payoutStatus,
  Value<DateTime?> payoutDate,
  Value<String?> guarantor1Name,
  Value<String?> guarantor1Phone,
  Value<String?> guarantor2Name,
  Value<String?> guarantor2Phone,
  Value<int?> guarantorMemberId,
  Value<double?> winnerPaid,
  Value<double?> winnerBalance,
  Value<double?> winnerLeft,
  Value<String?> winnerPaymentMode,
  Value<String?> winnerRemarks,
  Value<String?> hijriDate,
  Value<int?> exchangedToMemberId,
  Value<String?> exchangeNote,
});

final class $$RoundsTableReferences
    extends BaseReferences<_$AppDatabase, $RoundsTable, Round> {
  $$RoundsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $GroupsTable _groupIdTable(_$AppDatabase db) =>
      db.groups.createAlias('rounds__group_id__groups__id');

  $$GroupsTableProcessedTableManager get groupId {
    final $_column = $_itemColumn<int>('group_id')!;

    final manager = $$GroupsTableTableManager($_db, $_db.groups)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_groupIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static $MembersTable _winnerMemberIdTable(_$AppDatabase db) =>
      db.members.createAlias('rounds__winner_member_id__members__id');

  $$MembersTableProcessedTableManager? get winnerMemberId {
    final $_column = $_itemColumn<int>('winner_member_id');
    if ($_column == null) return null;
    final manager = $$MembersTableTableManager($_db, $_db.members)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_winnerMemberIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static $MembersTable _guarantorMemberIdTable(_$AppDatabase db) =>
      db.members.createAlias('rounds__guarantor_member_id__members__id');

  $$MembersTableProcessedTableManager? get guarantorMemberId {
    final $_column = $_itemColumn<int>('guarantor_member_id');
    if ($_column == null) return null;
    final manager = $$MembersTableTableManager($_db, $_db.members)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_guarantorMemberIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static $MembersTable _exchangedToMemberIdTable(_$AppDatabase db) =>
      db.members.createAlias('rounds__exchanged_to_member_id__members__id');

  $$MembersTableProcessedTableManager? get exchangedToMemberId {
    final $_column = $_itemColumn<int>('exchanged_to_member_id');
    if ($_column == null) return null;
    final manager = $$MembersTableTableManager($_db, $_db.members)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_exchangedToMemberIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static MultiTypedResultKey<$PaymentsTable, List<Payment>> _paymentsRefsTable(
          _$AppDatabase db) =>
      MultiTypedResultKey.fromTable(db.payments,
          aliasName: 'rounds__id__payments__round_id');

  $$PaymentsTableProcessedTableManager get paymentsRefs {
    final manager = $$PaymentsTableTableManager($_db, $_db.payments)
        .filter((f) => f.roundId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_paymentsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }
}

class $$RoundsTableFilterComposer
    extends Composer<_$AppDatabase, $RoundsTable> {
  $$RoundsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get roundNumber => $composableBuilder(
      column: $table.roundNumber, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get month => $composableBuilder(
      column: $table.month, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get year => $composableBuilder(
      column: $table.year, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get bidAmount => $composableBuilder(
      column: $table.bidAmount, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get foremanCommission => $composableBuilder(
      column: $table.foremanCommission,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get dividendDistributed => $composableBuilder(
      column: $table.dividendDistributed,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get payoutStatus => $composableBuilder(
      column: $table.payoutStatus, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get payoutDate => $composableBuilder(
      column: $table.payoutDate, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get guarantor1Name => $composableBuilder(
      column: $table.guarantor1Name,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get guarantor1Phone => $composableBuilder(
      column: $table.guarantor1Phone,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get guarantor2Name => $composableBuilder(
      column: $table.guarantor2Name,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get guarantor2Phone => $composableBuilder(
      column: $table.guarantor2Phone,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get winnerPaid => $composableBuilder(
      column: $table.winnerPaid, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get winnerBalance => $composableBuilder(
      column: $table.winnerBalance, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get winnerLeft => $composableBuilder(
      column: $table.winnerLeft, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get winnerPaymentMode => $composableBuilder(
      column: $table.winnerPaymentMode,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get winnerRemarks => $composableBuilder(
      column: $table.winnerRemarks, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get hijriDate => $composableBuilder(
      column: $table.hijriDate, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get exchangeNote => $composableBuilder(
      column: $table.exchangeNote, builder: (column) => ColumnFilters(column));

  $$GroupsTableFilterComposer get groupId {
    final $$GroupsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.groupId,
        referencedTable: $db.groups,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$GroupsTableFilterComposer(
              $db: $db,
              $table: $db.groups,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$MembersTableFilterComposer get winnerMemberId {
    final $$MembersTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.winnerMemberId,
        referencedTable: $db.members,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembersTableFilterComposer(
              $db: $db,
              $table: $db.members,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$MembersTableFilterComposer get guarantorMemberId {
    final $$MembersTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.guarantorMemberId,
        referencedTable: $db.members,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembersTableFilterComposer(
              $db: $db,
              $table: $db.members,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$MembersTableFilterComposer get exchangedToMemberId {
    final $$MembersTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.exchangedToMemberId,
        referencedTable: $db.members,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembersTableFilterComposer(
              $db: $db,
              $table: $db.members,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  Expression<bool> paymentsRefs(
      Expression<bool> Function($$PaymentsTableFilterComposer f) f) {
    final $$PaymentsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.payments,
        getReferencedColumn: (t) => t.roundId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$PaymentsTableFilterComposer(
              $db: $db,
              $table: $db.payments,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$RoundsTableOrderingComposer
    extends Composer<_$AppDatabase, $RoundsTable> {
  $$RoundsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get roundNumber => $composableBuilder(
      column: $table.roundNumber, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get month => $composableBuilder(
      column: $table.month, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get year => $composableBuilder(
      column: $table.year, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get bidAmount => $composableBuilder(
      column: $table.bidAmount, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get foremanCommission => $composableBuilder(
      column: $table.foremanCommission,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get dividendDistributed => $composableBuilder(
      column: $table.dividendDistributed,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get payoutStatus => $composableBuilder(
      column: $table.payoutStatus,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get payoutDate => $composableBuilder(
      column: $table.payoutDate, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get guarantor1Name => $composableBuilder(
      column: $table.guarantor1Name,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get guarantor1Phone => $composableBuilder(
      column: $table.guarantor1Phone,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get guarantor2Name => $composableBuilder(
      column: $table.guarantor2Name,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get guarantor2Phone => $composableBuilder(
      column: $table.guarantor2Phone,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get winnerPaid => $composableBuilder(
      column: $table.winnerPaid, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get winnerBalance => $composableBuilder(
      column: $table.winnerBalance,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get winnerLeft => $composableBuilder(
      column: $table.winnerLeft, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get winnerPaymentMode => $composableBuilder(
      column: $table.winnerPaymentMode,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get winnerRemarks => $composableBuilder(
      column: $table.winnerRemarks,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get hijriDate => $composableBuilder(
      column: $table.hijriDate, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get exchangeNote => $composableBuilder(
      column: $table.exchangeNote,
      builder: (column) => ColumnOrderings(column));

  $$GroupsTableOrderingComposer get groupId {
    final $$GroupsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.groupId,
        referencedTable: $db.groups,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$GroupsTableOrderingComposer(
              $db: $db,
              $table: $db.groups,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$MembersTableOrderingComposer get winnerMemberId {
    final $$MembersTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.winnerMemberId,
        referencedTable: $db.members,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembersTableOrderingComposer(
              $db: $db,
              $table: $db.members,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$MembersTableOrderingComposer get guarantorMemberId {
    final $$MembersTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.guarantorMemberId,
        referencedTable: $db.members,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembersTableOrderingComposer(
              $db: $db,
              $table: $db.members,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$MembersTableOrderingComposer get exchangedToMemberId {
    final $$MembersTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.exchangedToMemberId,
        referencedTable: $db.members,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembersTableOrderingComposer(
              $db: $db,
              $table: $db.members,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$RoundsTableAnnotationComposer
    extends Composer<_$AppDatabase, $RoundsTable> {
  $$RoundsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<int> get roundNumber => $composableBuilder(
      column: $table.roundNumber, builder: (column) => column);

  GeneratedColumn<int> get month =>
      $composableBuilder(column: $table.month, builder: (column) => column);

  GeneratedColumn<int> get year =>
      $composableBuilder(column: $table.year, builder: (column) => column);

  GeneratedColumn<double> get bidAmount =>
      $composableBuilder(column: $table.bidAmount, builder: (column) => column);

  GeneratedColumn<double> get foremanCommission => $composableBuilder(
      column: $table.foremanCommission, builder: (column) => column);

  GeneratedColumn<double> get dividendDistributed => $composableBuilder(
      column: $table.dividendDistributed, builder: (column) => column);

  GeneratedColumn<String> get payoutStatus => $composableBuilder(
      column: $table.payoutStatus, builder: (column) => column);

  GeneratedColumn<DateTime> get payoutDate => $composableBuilder(
      column: $table.payoutDate, builder: (column) => column);

  GeneratedColumn<String> get guarantor1Name => $composableBuilder(
      column: $table.guarantor1Name, builder: (column) => column);

  GeneratedColumn<String> get guarantor1Phone => $composableBuilder(
      column: $table.guarantor1Phone, builder: (column) => column);

  GeneratedColumn<String> get guarantor2Name => $composableBuilder(
      column: $table.guarantor2Name, builder: (column) => column);

  GeneratedColumn<String> get guarantor2Phone => $composableBuilder(
      column: $table.guarantor2Phone, builder: (column) => column);

  GeneratedColumn<double> get winnerPaid => $composableBuilder(
      column: $table.winnerPaid, builder: (column) => column);

  GeneratedColumn<double> get winnerBalance => $composableBuilder(
      column: $table.winnerBalance, builder: (column) => column);

  GeneratedColumn<double> get winnerLeft => $composableBuilder(
      column: $table.winnerLeft, builder: (column) => column);

  GeneratedColumn<String> get winnerPaymentMode => $composableBuilder(
      column: $table.winnerPaymentMode, builder: (column) => column);

  GeneratedColumn<String> get winnerRemarks => $composableBuilder(
      column: $table.winnerRemarks, builder: (column) => column);

  GeneratedColumn<String> get hijriDate =>
      $composableBuilder(column: $table.hijriDate, builder: (column) => column);

  GeneratedColumn<String> get exchangeNote => $composableBuilder(
      column: $table.exchangeNote, builder: (column) => column);

  $$GroupsTableAnnotationComposer get groupId {
    final $$GroupsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.groupId,
        referencedTable: $db.groups,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$GroupsTableAnnotationComposer(
              $db: $db,
              $table: $db.groups,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$MembersTableAnnotationComposer get winnerMemberId {
    final $$MembersTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.winnerMemberId,
        referencedTable: $db.members,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembersTableAnnotationComposer(
              $db: $db,
              $table: $db.members,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$MembersTableAnnotationComposer get guarantorMemberId {
    final $$MembersTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.guarantorMemberId,
        referencedTable: $db.members,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembersTableAnnotationComposer(
              $db: $db,
              $table: $db.members,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$MembersTableAnnotationComposer get exchangedToMemberId {
    final $$MembersTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.exchangedToMemberId,
        referencedTable: $db.members,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembersTableAnnotationComposer(
              $db: $db,
              $table: $db.members,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  Expression<T> paymentsRefs<T extends Object>(
      Expression<T> Function($$PaymentsTableAnnotationComposer a) f) {
    final $$PaymentsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.payments,
        getReferencedColumn: (t) => t.roundId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$PaymentsTableAnnotationComposer(
              $db: $db,
              $table: $db.payments,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$RoundsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $RoundsTable,
    Round,
    $$RoundsTableFilterComposer,
    $$RoundsTableOrderingComposer,
    $$RoundsTableAnnotationComposer,
    $$RoundsTableCreateCompanionBuilder,
    $$RoundsTableUpdateCompanionBuilder,
    (Round, $$RoundsTableReferences),
    Round,
    PrefetchHooks Function(
        {bool groupId,
        bool winnerMemberId,
        bool guarantorMemberId,
        bool exchangedToMemberId,
        bool paymentsRefs})> {
  $$RoundsTableTableManager(_$AppDatabase db, $RoundsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$RoundsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$RoundsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$RoundsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int> groupId = const Value.absent(),
            Value<int> roundNumber = const Value.absent(),
            Value<int> month = const Value.absent(),
            Value<int> year = const Value.absent(),
            Value<double?> bidAmount = const Value.absent(),
            Value<int?> winnerMemberId = const Value.absent(),
            Value<double?> foremanCommission = const Value.absent(),
            Value<double?> dividendDistributed = const Value.absent(),
            Value<String> payoutStatus = const Value.absent(),
            Value<DateTime?> payoutDate = const Value.absent(),
            Value<String?> guarantor1Name = const Value.absent(),
            Value<String?> guarantor1Phone = const Value.absent(),
            Value<String?> guarantor2Name = const Value.absent(),
            Value<String?> guarantor2Phone = const Value.absent(),
            Value<int?> guarantorMemberId = const Value.absent(),
            Value<double?> winnerPaid = const Value.absent(),
            Value<double?> winnerBalance = const Value.absent(),
            Value<double?> winnerLeft = const Value.absent(),
            Value<String?> winnerPaymentMode = const Value.absent(),
            Value<String?> winnerRemarks = const Value.absent(),
            Value<String?> hijriDate = const Value.absent(),
            Value<int?> exchangedToMemberId = const Value.absent(),
            Value<String?> exchangeNote = const Value.absent(),
          }) =>
              RoundsCompanion(
            id: id,
            groupId: groupId,
            roundNumber: roundNumber,
            month: month,
            year: year,
            bidAmount: bidAmount,
            winnerMemberId: winnerMemberId,
            foremanCommission: foremanCommission,
            dividendDistributed: dividendDistributed,
            payoutStatus: payoutStatus,
            payoutDate: payoutDate,
            guarantor1Name: guarantor1Name,
            guarantor1Phone: guarantor1Phone,
            guarantor2Name: guarantor2Name,
            guarantor2Phone: guarantor2Phone,
            guarantorMemberId: guarantorMemberId,
            winnerPaid: winnerPaid,
            winnerBalance: winnerBalance,
            winnerLeft: winnerLeft,
            winnerPaymentMode: winnerPaymentMode,
            winnerRemarks: winnerRemarks,
            hijriDate: hijriDate,
            exchangedToMemberId: exchangedToMemberId,
            exchangeNote: exchangeNote,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required int groupId,
            required int roundNumber,
            required int month,
            required int year,
            Value<double?> bidAmount = const Value.absent(),
            Value<int?> winnerMemberId = const Value.absent(),
            Value<double?> foremanCommission = const Value.absent(),
            Value<double?> dividendDistributed = const Value.absent(),
            Value<String> payoutStatus = const Value.absent(),
            Value<DateTime?> payoutDate = const Value.absent(),
            Value<String?> guarantor1Name = const Value.absent(),
            Value<String?> guarantor1Phone = const Value.absent(),
            Value<String?> guarantor2Name = const Value.absent(),
            Value<String?> guarantor2Phone = const Value.absent(),
            Value<int?> guarantorMemberId = const Value.absent(),
            Value<double?> winnerPaid = const Value.absent(),
            Value<double?> winnerBalance = const Value.absent(),
            Value<double?> winnerLeft = const Value.absent(),
            Value<String?> winnerPaymentMode = const Value.absent(),
            Value<String?> winnerRemarks = const Value.absent(),
            Value<String?> hijriDate = const Value.absent(),
            Value<int?> exchangedToMemberId = const Value.absent(),
            Value<String?> exchangeNote = const Value.absent(),
          }) =>
              RoundsCompanion.insert(
            id: id,
            groupId: groupId,
            roundNumber: roundNumber,
            month: month,
            year: year,
            bidAmount: bidAmount,
            winnerMemberId: winnerMemberId,
            foremanCommission: foremanCommission,
            dividendDistributed: dividendDistributed,
            payoutStatus: payoutStatus,
            payoutDate: payoutDate,
            guarantor1Name: guarantor1Name,
            guarantor1Phone: guarantor1Phone,
            guarantor2Name: guarantor2Name,
            guarantor2Phone: guarantor2Phone,
            guarantorMemberId: guarantorMemberId,
            winnerPaid: winnerPaid,
            winnerBalance: winnerBalance,
            winnerLeft: winnerLeft,
            winnerPaymentMode: winnerPaymentMode,
            winnerRemarks: winnerRemarks,
            hijriDate: hijriDate,
            exchangedToMemberId: exchangedToMemberId,
            exchangeNote: exchangeNote,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) =>
                  (e.readTable(table), $$RoundsTableReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: (
              {groupId = false,
              winnerMemberId = false,
              guarantorMemberId = false,
              exchangedToMemberId = false,
              paymentsRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [if (paymentsRefs) db.payments],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (groupId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.groupId,
                    referencedTable: $$RoundsTableReferences._groupIdTable(db),
                    referencedColumn:
                        $$RoundsTableReferences._groupIdTable(db).id,
                  ) as T;
                }
                if (winnerMemberId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.winnerMemberId,
                    referencedTable:
                        $$RoundsTableReferences._winnerMemberIdTable(db),
                    referencedColumn:
                        $$RoundsTableReferences._winnerMemberIdTable(db).id,
                  ) as T;
                }
                if (guarantorMemberId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.guarantorMemberId,
                    referencedTable:
                        $$RoundsTableReferences._guarantorMemberIdTable(db),
                    referencedColumn:
                        $$RoundsTableReferences._guarantorMemberIdTable(db).id,
                  ) as T;
                }
                if (exchangedToMemberId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.exchangedToMemberId,
                    referencedTable:
                        $$RoundsTableReferences._exchangedToMemberIdTable(db),
                    referencedColumn: $$RoundsTableReferences
                        ._exchangedToMemberIdTable(db)
                        .id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [
                  if (paymentsRefs)
                    await $_getPrefetchedData<Round, $RoundsTable, Payment>(
                        currentTable: table,
                        referencedTable:
                            $$RoundsTableReferences._paymentsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$RoundsTableReferences(db, table, p0).paymentsRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.roundId == item.id),
                        typedResults: items)
                ];
              },
            );
          },
        ));
}

typedef $$RoundsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $RoundsTable,
    Round,
    $$RoundsTableFilterComposer,
    $$RoundsTableOrderingComposer,
    $$RoundsTableAnnotationComposer,
    $$RoundsTableCreateCompanionBuilder,
    $$RoundsTableUpdateCompanionBuilder,
    (Round, $$RoundsTableReferences),
    Round,
    PrefetchHooks Function(
        {bool groupId,
        bool winnerMemberId,
        bool guarantorMemberId,
        bool exchangedToMemberId,
        bool paymentsRefs})>;
typedef $$PaymentsTableCreateCompanionBuilder = PaymentsCompanion Function({
  Value<int> id,
  required int membershipId,
  required int roundId,
  required double amount,
  Value<DateTime> paymentDate,
  required String paymentMode,
  Value<String> status,
  Value<String?> remarks,
  Value<String?> collector,
  Value<String?> transactionId,
  Value<String?> receiptPhotoPath,
  Value<String?> collectorName,
});
typedef $$PaymentsTableUpdateCompanionBuilder = PaymentsCompanion Function({
  Value<int> id,
  Value<int> membershipId,
  Value<int> roundId,
  Value<double> amount,
  Value<DateTime> paymentDate,
  Value<String> paymentMode,
  Value<String> status,
  Value<String?> remarks,
  Value<String?> collector,
  Value<String?> transactionId,
  Value<String?> receiptPhotoPath,
  Value<String?> collectorName,
});

final class $$PaymentsTableReferences
    extends BaseReferences<_$AppDatabase, $PaymentsTable, Payment> {
  $$PaymentsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $MembershipsTable _membershipIdTable(_$AppDatabase db) =>
      db.memberships.createAlias('payments__membership_id__memberships__id');

  $$MembershipsTableProcessedTableManager get membershipId {
    final $_column = $_itemColumn<int>('membership_id')!;

    final manager = $$MembershipsTableTableManager($_db, $_db.memberships)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_membershipIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static $RoundsTable _roundIdTable(_$AppDatabase db) =>
      db.rounds.createAlias('payments__round_id__rounds__id');

  $$RoundsTableProcessedTableManager get roundId {
    final $_column = $_itemColumn<int>('round_id')!;

    final manager = $$RoundsTableTableManager($_db, $_db.rounds)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_roundIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }
}

class $$PaymentsTableFilterComposer
    extends Composer<_$AppDatabase, $PaymentsTable> {
  $$PaymentsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get amount => $composableBuilder(
      column: $table.amount, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get paymentDate => $composableBuilder(
      column: $table.paymentDate, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get paymentMode => $composableBuilder(
      column: $table.paymentMode, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get remarks => $composableBuilder(
      column: $table.remarks, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get collector => $composableBuilder(
      column: $table.collector, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get transactionId => $composableBuilder(
      column: $table.transactionId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get receiptPhotoPath => $composableBuilder(
      column: $table.receiptPhotoPath,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get collectorName => $composableBuilder(
      column: $table.collectorName, builder: (column) => ColumnFilters(column));

  $$MembershipsTableFilterComposer get membershipId {
    final $$MembershipsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.membershipId,
        referencedTable: $db.memberships,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembershipsTableFilterComposer(
              $db: $db,
              $table: $db.memberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$RoundsTableFilterComposer get roundId {
    final $$RoundsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.roundId,
        referencedTable: $db.rounds,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$RoundsTableFilterComposer(
              $db: $db,
              $table: $db.rounds,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$PaymentsTableOrderingComposer
    extends Composer<_$AppDatabase, $PaymentsTable> {
  $$PaymentsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get amount => $composableBuilder(
      column: $table.amount, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get paymentDate => $composableBuilder(
      column: $table.paymentDate, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get paymentMode => $composableBuilder(
      column: $table.paymentMode, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get remarks => $composableBuilder(
      column: $table.remarks, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get collector => $composableBuilder(
      column: $table.collector, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get transactionId => $composableBuilder(
      column: $table.transactionId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get receiptPhotoPath => $composableBuilder(
      column: $table.receiptPhotoPath,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get collectorName => $composableBuilder(
      column: $table.collectorName,
      builder: (column) => ColumnOrderings(column));

  $$MembershipsTableOrderingComposer get membershipId {
    final $$MembershipsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.membershipId,
        referencedTable: $db.memberships,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembershipsTableOrderingComposer(
              $db: $db,
              $table: $db.memberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$RoundsTableOrderingComposer get roundId {
    final $$RoundsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.roundId,
        referencedTable: $db.rounds,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$RoundsTableOrderingComposer(
              $db: $db,
              $table: $db.rounds,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$PaymentsTableAnnotationComposer
    extends Composer<_$AppDatabase, $PaymentsTable> {
  $$PaymentsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<double> get amount =>
      $composableBuilder(column: $table.amount, builder: (column) => column);

  GeneratedColumn<DateTime> get paymentDate => $composableBuilder(
      column: $table.paymentDate, builder: (column) => column);

  GeneratedColumn<String> get paymentMode => $composableBuilder(
      column: $table.paymentMode, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get remarks =>
      $composableBuilder(column: $table.remarks, builder: (column) => column);

  GeneratedColumn<String> get collector =>
      $composableBuilder(column: $table.collector, builder: (column) => column);

  GeneratedColumn<String> get transactionId => $composableBuilder(
      column: $table.transactionId, builder: (column) => column);

  GeneratedColumn<String> get receiptPhotoPath => $composableBuilder(
      column: $table.receiptPhotoPath, builder: (column) => column);

  GeneratedColumn<String> get collectorName => $composableBuilder(
      column: $table.collectorName, builder: (column) => column);

  $$MembershipsTableAnnotationComposer get membershipId {
    final $$MembershipsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.membershipId,
        referencedTable: $db.memberships,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembershipsTableAnnotationComposer(
              $db: $db,
              $table: $db.memberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$RoundsTableAnnotationComposer get roundId {
    final $$RoundsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.roundId,
        referencedTable: $db.rounds,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$RoundsTableAnnotationComposer(
              $db: $db,
              $table: $db.rounds,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$PaymentsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $PaymentsTable,
    Payment,
    $$PaymentsTableFilterComposer,
    $$PaymentsTableOrderingComposer,
    $$PaymentsTableAnnotationComposer,
    $$PaymentsTableCreateCompanionBuilder,
    $$PaymentsTableUpdateCompanionBuilder,
    (Payment, $$PaymentsTableReferences),
    Payment,
    PrefetchHooks Function({bool membershipId, bool roundId})> {
  $$PaymentsTableTableManager(_$AppDatabase db, $PaymentsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$PaymentsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$PaymentsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$PaymentsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int> membershipId = const Value.absent(),
            Value<int> roundId = const Value.absent(),
            Value<double> amount = const Value.absent(),
            Value<DateTime> paymentDate = const Value.absent(),
            Value<String> paymentMode = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<String?> remarks = const Value.absent(),
            Value<String?> collector = const Value.absent(),
            Value<String?> transactionId = const Value.absent(),
            Value<String?> receiptPhotoPath = const Value.absent(),
            Value<String?> collectorName = const Value.absent(),
          }) =>
              PaymentsCompanion(
            id: id,
            membershipId: membershipId,
            roundId: roundId,
            amount: amount,
            paymentDate: paymentDate,
            paymentMode: paymentMode,
            status: status,
            remarks: remarks,
            collector: collector,
            transactionId: transactionId,
            receiptPhotoPath: receiptPhotoPath,
            collectorName: collectorName,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required int membershipId,
            required int roundId,
            required double amount,
            Value<DateTime> paymentDate = const Value.absent(),
            required String paymentMode,
            Value<String> status = const Value.absent(),
            Value<String?> remarks = const Value.absent(),
            Value<String?> collector = const Value.absent(),
            Value<String?> transactionId = const Value.absent(),
            Value<String?> receiptPhotoPath = const Value.absent(),
            Value<String?> collectorName = const Value.absent(),
          }) =>
              PaymentsCompanion.insert(
            id: id,
            membershipId: membershipId,
            roundId: roundId,
            amount: amount,
            paymentDate: paymentDate,
            paymentMode: paymentMode,
            status: status,
            remarks: remarks,
            collector: collector,
            transactionId: transactionId,
            receiptPhotoPath: receiptPhotoPath,
            collectorName: collectorName,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) =>
                  (e.readTable(table), $$PaymentsTableReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: ({membershipId = false, roundId = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (membershipId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.membershipId,
                    referencedTable:
                        $$PaymentsTableReferences._membershipIdTable(db),
                    referencedColumn:
                        $$PaymentsTableReferences._membershipIdTable(db).id,
                  ) as T;
                }
                if (roundId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.roundId,
                    referencedTable:
                        $$PaymentsTableReferences._roundIdTable(db),
                    referencedColumn:
                        $$PaymentsTableReferences._roundIdTable(db).id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [];
              },
            );
          },
        ));
}

typedef $$PaymentsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $PaymentsTable,
    Payment,
    $$PaymentsTableFilterComposer,
    $$PaymentsTableOrderingComposer,
    $$PaymentsTableAnnotationComposer,
    $$PaymentsTableCreateCompanionBuilder,
    $$PaymentsTableUpdateCompanionBuilder,
    (Payment, $$PaymentsTableReferences),
    Payment,
    PrefetchHooks Function({bool membershipId, bool roundId})>;
typedef $$AdminSettingsTableCreateCompanionBuilder = AdminSettingsCompanion
    Function({
  required String key,
  required String value,
  Value<int> rowid,
});
typedef $$AdminSettingsTableUpdateCompanionBuilder = AdminSettingsCompanion
    Function({
  Value<String> key,
  Value<String> value,
  Value<int> rowid,
});

class $$AdminSettingsTableFilterComposer
    extends Composer<_$AppDatabase, $AdminSettingsTable> {
  $$AdminSettingsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get key => $composableBuilder(
      column: $table.key, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get value => $composableBuilder(
      column: $table.value, builder: (column) => ColumnFilters(column));
}

class $$AdminSettingsTableOrderingComposer
    extends Composer<_$AppDatabase, $AdminSettingsTable> {
  $$AdminSettingsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get key => $composableBuilder(
      column: $table.key, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get value => $composableBuilder(
      column: $table.value, builder: (column) => ColumnOrderings(column));
}

class $$AdminSettingsTableAnnotationComposer
    extends Composer<_$AppDatabase, $AdminSettingsTable> {
  $$AdminSettingsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get key =>
      $composableBuilder(column: $table.key, builder: (column) => column);

  GeneratedColumn<String> get value =>
      $composableBuilder(column: $table.value, builder: (column) => column);
}

class $$AdminSettingsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $AdminSettingsTable,
    AdminSetting,
    $$AdminSettingsTableFilterComposer,
    $$AdminSettingsTableOrderingComposer,
    $$AdminSettingsTableAnnotationComposer,
    $$AdminSettingsTableCreateCompanionBuilder,
    $$AdminSettingsTableUpdateCompanionBuilder,
    (
      AdminSetting,
      BaseReferences<_$AppDatabase, $AdminSettingsTable, AdminSetting>
    ),
    AdminSetting,
    PrefetchHooks Function()> {
  $$AdminSettingsTableTableManager(_$AppDatabase db, $AdminSettingsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$AdminSettingsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$AdminSettingsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$AdminSettingsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> key = const Value.absent(),
            Value<String> value = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              AdminSettingsCompanion(
            key: key,
            value: value,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String key,
            required String value,
            Value<int> rowid = const Value.absent(),
          }) =>
              AdminSettingsCompanion.insert(
            key: key,
            value: value,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$AdminSettingsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $AdminSettingsTable,
    AdminSetting,
    $$AdminSettingsTableFilterComposer,
    $$AdminSettingsTableOrderingComposer,
    $$AdminSettingsTableAnnotationComposer,
    $$AdminSettingsTableCreateCompanionBuilder,
    $$AdminSettingsTableUpdateCompanionBuilder,
    (
      AdminSetting,
      BaseReferences<_$AppDatabase, $AdminSettingsTable, AdminSetting>
    ),
    AdminSetting,
    PrefetchHooks Function()>;
typedef $$AuditLogsTableCreateCompanionBuilder = AuditLogsCompanion Function({
  Value<int> id,
  required String action,
  required String targetName,
  Value<String?> details,
  Value<DateTime> timestamp,
});
typedef $$AuditLogsTableUpdateCompanionBuilder = AuditLogsCompanion Function({
  Value<int> id,
  Value<String> action,
  Value<String> targetName,
  Value<String?> details,
  Value<DateTime> timestamp,
});

class $$AuditLogsTableFilterComposer
    extends Composer<_$AppDatabase, $AuditLogsTable> {
  $$AuditLogsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get action => $composableBuilder(
      column: $table.action, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get targetName => $composableBuilder(
      column: $table.targetName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get details => $composableBuilder(
      column: $table.details, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get timestamp => $composableBuilder(
      column: $table.timestamp, builder: (column) => ColumnFilters(column));
}

class $$AuditLogsTableOrderingComposer
    extends Composer<_$AppDatabase, $AuditLogsTable> {
  $$AuditLogsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get action => $composableBuilder(
      column: $table.action, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get targetName => $composableBuilder(
      column: $table.targetName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get details => $composableBuilder(
      column: $table.details, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get timestamp => $composableBuilder(
      column: $table.timestamp, builder: (column) => ColumnOrderings(column));
}

class $$AuditLogsTableAnnotationComposer
    extends Composer<_$AppDatabase, $AuditLogsTable> {
  $$AuditLogsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get action =>
      $composableBuilder(column: $table.action, builder: (column) => column);

  GeneratedColumn<String> get targetName => $composableBuilder(
      column: $table.targetName, builder: (column) => column);

  GeneratedColumn<String> get details =>
      $composableBuilder(column: $table.details, builder: (column) => column);

  GeneratedColumn<DateTime> get timestamp =>
      $composableBuilder(column: $table.timestamp, builder: (column) => column);
}

class $$AuditLogsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $AuditLogsTable,
    AuditLog,
    $$AuditLogsTableFilterComposer,
    $$AuditLogsTableOrderingComposer,
    $$AuditLogsTableAnnotationComposer,
    $$AuditLogsTableCreateCompanionBuilder,
    $$AuditLogsTableUpdateCompanionBuilder,
    (AuditLog, BaseReferences<_$AppDatabase, $AuditLogsTable, AuditLog>),
    AuditLog,
    PrefetchHooks Function()> {
  $$AuditLogsTableTableManager(_$AppDatabase db, $AuditLogsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$AuditLogsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$AuditLogsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$AuditLogsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> action = const Value.absent(),
            Value<String> targetName = const Value.absent(),
            Value<String?> details = const Value.absent(),
            Value<DateTime> timestamp = const Value.absent(),
          }) =>
              AuditLogsCompanion(
            id: id,
            action: action,
            targetName: targetName,
            details: details,
            timestamp: timestamp,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required String action,
            required String targetName,
            Value<String?> details = const Value.absent(),
            Value<DateTime> timestamp = const Value.absent(),
          }) =>
              AuditLogsCompanion.insert(
            id: id,
            action: action,
            targetName: targetName,
            details: details,
            timestamp: timestamp,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$AuditLogsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $AuditLogsTable,
    AuditLog,
    $$AuditLogsTableFilterComposer,
    $$AuditLogsTableOrderingComposer,
    $$AuditLogsTableAnnotationComposer,
    $$AuditLogsTableCreateCompanionBuilder,
    $$AuditLogsTableUpdateCompanionBuilder,
    (AuditLog, BaseReferences<_$AppDatabase, $AuditLogsTable, AuditLog>),
    AuditLog,
    PrefetchHooks Function()>;
typedef $$SHGGroupsTableCreateCompanionBuilder = SHGGroupsCompanion Function({
  Value<int> id,
  required String name,
  Value<DateTime> formationDate,
  Value<double> monthlySavingAmount,
  Value<String?> bankAccountNumber,
  Value<String?> ifscCode,
  Value<String?> bankName,
  Value<String> status,
});
typedef $$SHGGroupsTableUpdateCompanionBuilder = SHGGroupsCompanion Function({
  Value<int> id,
  Value<String> name,
  Value<DateTime> formationDate,
  Value<double> monthlySavingAmount,
  Value<String?> bankAccountNumber,
  Value<String?> ifscCode,
  Value<String?> bankName,
  Value<String> status,
});

final class $$SHGGroupsTableReferences
    extends BaseReferences<_$AppDatabase, $SHGGroupsTable, SHGGroup> {
  $$SHGGroupsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static MultiTypedResultKey<$SHGMembershipsTable, List<SHGMembership>>
      _sHGMembershipsRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.sHGMemberships,
              aliasName: 's_h_g_groups__id__s_h_g_memberships__group_id');

  $$SHGMembershipsTableProcessedTableManager get sHGMembershipsRefs {
    final manager = $$SHGMembershipsTableTableManager($_db, $_db.sHGMemberships)
        .filter((f) => f.groupId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_sHGMembershipsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }

  static MultiTypedResultKey<$SHGMeetingsTable, List<SHGMeeting>>
      _sHGMeetingsRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.sHGMeetings,
              aliasName: 's_h_g_groups__id__s_h_g_meetings__group_id');

  $$SHGMeetingsTableProcessedTableManager get sHGMeetingsRefs {
    final manager = $$SHGMeetingsTableTableManager($_db, $_db.sHGMeetings)
        .filter((f) => f.groupId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_sHGMeetingsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }

  static MultiTypedResultKey<$SHGCashBooksTable, List<SHGCashBook>>
      _sHGCashBooksRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.sHGCashBooks,
              aliasName: 's_h_g_groups__id__s_h_g_cash_books__group_id');

  $$SHGCashBooksTableProcessedTableManager get sHGCashBooksRefs {
    final manager = $$SHGCashBooksTableTableManager($_db, $_db.sHGCashBooks)
        .filter((f) => f.groupId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_sHGCashBooksRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }
}

class $$SHGGroupsTableFilterComposer
    extends Composer<_$AppDatabase, $SHGGroupsTable> {
  $$SHGGroupsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get formationDate => $composableBuilder(
      column: $table.formationDate, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get monthlySavingAmount => $composableBuilder(
      column: $table.monthlySavingAmount,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get bankAccountNumber => $composableBuilder(
      column: $table.bankAccountNumber,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get ifscCode => $composableBuilder(
      column: $table.ifscCode, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get bankName => $composableBuilder(
      column: $table.bankName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  Expression<bool> sHGMembershipsRefs(
      Expression<bool> Function($$SHGMembershipsTableFilterComposer f) f) {
    final $$SHGMembershipsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGMemberships,
        getReferencedColumn: (t) => t.groupId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMembershipsTableFilterComposer(
              $db: $db,
              $table: $db.sHGMemberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<bool> sHGMeetingsRefs(
      Expression<bool> Function($$SHGMeetingsTableFilterComposer f) f) {
    final $$SHGMeetingsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGMeetings,
        getReferencedColumn: (t) => t.groupId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMeetingsTableFilterComposer(
              $db: $db,
              $table: $db.sHGMeetings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<bool> sHGCashBooksRefs(
      Expression<bool> Function($$SHGCashBooksTableFilterComposer f) f) {
    final $$SHGCashBooksTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGCashBooks,
        getReferencedColumn: (t) => t.groupId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGCashBooksTableFilterComposer(
              $db: $db,
              $table: $db.sHGCashBooks,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$SHGGroupsTableOrderingComposer
    extends Composer<_$AppDatabase, $SHGGroupsTable> {
  $$SHGGroupsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get formationDate => $composableBuilder(
      column: $table.formationDate,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get monthlySavingAmount => $composableBuilder(
      column: $table.monthlySavingAmount,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get bankAccountNumber => $composableBuilder(
      column: $table.bankAccountNumber,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get ifscCode => $composableBuilder(
      column: $table.ifscCode, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get bankName => $composableBuilder(
      column: $table.bankName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));
}

class $$SHGGroupsTableAnnotationComposer
    extends Composer<_$AppDatabase, $SHGGroupsTable> {
  $$SHGGroupsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<DateTime> get formationDate => $composableBuilder(
      column: $table.formationDate, builder: (column) => column);

  GeneratedColumn<double> get monthlySavingAmount => $composableBuilder(
      column: $table.monthlySavingAmount, builder: (column) => column);

  GeneratedColumn<String> get bankAccountNumber => $composableBuilder(
      column: $table.bankAccountNumber, builder: (column) => column);

  GeneratedColumn<String> get ifscCode =>
      $composableBuilder(column: $table.ifscCode, builder: (column) => column);

  GeneratedColumn<String> get bankName =>
      $composableBuilder(column: $table.bankName, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  Expression<T> sHGMembershipsRefs<T extends Object>(
      Expression<T> Function($$SHGMembershipsTableAnnotationComposer a) f) {
    final $$SHGMembershipsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGMemberships,
        getReferencedColumn: (t) => t.groupId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMembershipsTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGMemberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<T> sHGMeetingsRefs<T extends Object>(
      Expression<T> Function($$SHGMeetingsTableAnnotationComposer a) f) {
    final $$SHGMeetingsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGMeetings,
        getReferencedColumn: (t) => t.groupId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMeetingsTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGMeetings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<T> sHGCashBooksRefs<T extends Object>(
      Expression<T> Function($$SHGCashBooksTableAnnotationComposer a) f) {
    final $$SHGCashBooksTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGCashBooks,
        getReferencedColumn: (t) => t.groupId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGCashBooksTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGCashBooks,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$SHGGroupsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SHGGroupsTable,
    SHGGroup,
    $$SHGGroupsTableFilterComposer,
    $$SHGGroupsTableOrderingComposer,
    $$SHGGroupsTableAnnotationComposer,
    $$SHGGroupsTableCreateCompanionBuilder,
    $$SHGGroupsTableUpdateCompanionBuilder,
    (SHGGroup, $$SHGGroupsTableReferences),
    SHGGroup,
    PrefetchHooks Function(
        {bool sHGMembershipsRefs,
        bool sHGMeetingsRefs,
        bool sHGCashBooksRefs})> {
  $$SHGGroupsTableTableManager(_$AppDatabase db, $SHGGroupsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SHGGroupsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SHGGroupsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SHGGroupsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<DateTime> formationDate = const Value.absent(),
            Value<double> monthlySavingAmount = const Value.absent(),
            Value<String?> bankAccountNumber = const Value.absent(),
            Value<String?> ifscCode = const Value.absent(),
            Value<String?> bankName = const Value.absent(),
            Value<String> status = const Value.absent(),
          }) =>
              SHGGroupsCompanion(
            id: id,
            name: name,
            formationDate: formationDate,
            monthlySavingAmount: monthlySavingAmount,
            bankAccountNumber: bankAccountNumber,
            ifscCode: ifscCode,
            bankName: bankName,
            status: status,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required String name,
            Value<DateTime> formationDate = const Value.absent(),
            Value<double> monthlySavingAmount = const Value.absent(),
            Value<String?> bankAccountNumber = const Value.absent(),
            Value<String?> ifscCode = const Value.absent(),
            Value<String?> bankName = const Value.absent(),
            Value<String> status = const Value.absent(),
          }) =>
              SHGGroupsCompanion.insert(
            id: id,
            name: name,
            formationDate: formationDate,
            monthlySavingAmount: monthlySavingAmount,
            bankAccountNumber: bankAccountNumber,
            ifscCode: ifscCode,
            bankName: bankName,
            status: status,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable(table),
                    $$SHGGroupsTableReferences(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: (
              {sHGMembershipsRefs = false,
              sHGMeetingsRefs = false,
              sHGCashBooksRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [
                if (sHGMembershipsRefs) db.sHGMemberships,
                if (sHGMeetingsRefs) db.sHGMeetings,
                if (sHGCashBooksRefs) db.sHGCashBooks
              ],
              addJoins: null,
              getPrefetchedDataCallback: (items) async {
                return [
                  if (sHGMembershipsRefs)
                    await $_getPrefetchedData<SHGGroup, $SHGGroupsTable,
                            SHGMembership>(
                        currentTable: table,
                        referencedTable: $$SHGGroupsTableReferences
                            ._sHGMembershipsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$SHGGroupsTableReferences(db, table, p0)
                                .sHGMembershipsRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.groupId == item.id),
                        typedResults: items),
                  if (sHGMeetingsRefs)
                    await $_getPrefetchedData<SHGGroup, $SHGGroupsTable,
                            SHGMeeting>(
                        currentTable: table,
                        referencedTable: $$SHGGroupsTableReferences
                            ._sHGMeetingsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$SHGGroupsTableReferences(db, table, p0)
                                .sHGMeetingsRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.groupId == item.id),
                        typedResults: items),
                  if (sHGCashBooksRefs)
                    await $_getPrefetchedData<SHGGroup, $SHGGroupsTable,
                            SHGCashBook>(
                        currentTable: table,
                        referencedTable: $$SHGGroupsTableReferences
                            ._sHGCashBooksRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$SHGGroupsTableReferences(db, table, p0)
                                .sHGCashBooksRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.groupId == item.id),
                        typedResults: items)
                ];
              },
            );
          },
        ));
}

typedef $$SHGGroupsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SHGGroupsTable,
    SHGGroup,
    $$SHGGroupsTableFilterComposer,
    $$SHGGroupsTableOrderingComposer,
    $$SHGGroupsTableAnnotationComposer,
    $$SHGGroupsTableCreateCompanionBuilder,
    $$SHGGroupsTableUpdateCompanionBuilder,
    (SHGGroup, $$SHGGroupsTableReferences),
    SHGGroup,
    PrefetchHooks Function(
        {bool sHGMembershipsRefs,
        bool sHGMeetingsRefs,
        bool sHGCashBooksRefs})>;
typedef $$SHGMembershipsTableCreateCompanionBuilder = SHGMembershipsCompanion
    Function({
  Value<int> id,
  required int memberId,
  required int groupId,
  Value<DateTime> joinedAt,
  Value<String> role,
});
typedef $$SHGMembershipsTableUpdateCompanionBuilder = SHGMembershipsCompanion
    Function({
  Value<int> id,
  Value<int> memberId,
  Value<int> groupId,
  Value<DateTime> joinedAt,
  Value<String> role,
});

final class $$SHGMembershipsTableReferences
    extends BaseReferences<_$AppDatabase, $SHGMembershipsTable, SHGMembership> {
  $$SHGMembershipsTableReferences(
      super.$_db, super.$_table, super.$_typedResult);

  static $MembersTable _memberIdTable(_$AppDatabase db) =>
      db.members.createAlias('s_h_g_memberships__member_id__members__id');

  $$MembersTableProcessedTableManager get memberId {
    final $_column = $_itemColumn<int>('member_id')!;

    final manager = $$MembersTableTableManager($_db, $_db.members)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_memberIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static $SHGGroupsTable _groupIdTable(_$AppDatabase db) =>
      db.sHGGroups.createAlias('s_h_g_memberships__group_id__s_h_g_groups__id');

  $$SHGGroupsTableProcessedTableManager get groupId {
    final $_column = $_itemColumn<int>('group_id')!;

    final manager = $$SHGGroupsTableTableManager($_db, $_db.sHGGroups)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_groupIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static MultiTypedResultKey<$SHGSavingsTable, List<SHGSaving>>
      _sHGSavingsRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.sHGSavings,
              aliasName: 's_h_g_memberships__id__s_h_g_savings__membership_id');

  $$SHGSavingsTableProcessedTableManager get sHGSavingsRefs {
    final manager = $$SHGSavingsTableTableManager($_db, $_db.sHGSavings)
        .filter((f) => f.membershipId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_sHGSavingsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }

  static MultiTypedResultKey<$SHGLoansTable, List<SHGLoan>> _sHGLoansRefsTable(
          _$AppDatabase db) =>
      MultiTypedResultKey.fromTable(db.sHGLoans,
          aliasName: 's_h_g_memberships__id__s_h_g_loans__membership_id');

  $$SHGLoansTableProcessedTableManager get sHGLoansRefs {
    final manager = $$SHGLoansTableTableManager($_db, $_db.sHGLoans)
        .filter((f) => f.membershipId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_sHGLoansRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }

  static MultiTypedResultKey<$SHGAttendancesTable, List<SHGAttendance>>
      _sHGAttendancesRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.sHGAttendances,
              aliasName:
                  's_h_g_memberships__id__s_h_g_attendances__membership_id');

  $$SHGAttendancesTableProcessedTableManager get sHGAttendancesRefs {
    final manager = $$SHGAttendancesTableTableManager($_db, $_db.sHGAttendances)
        .filter((f) => f.membershipId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_sHGAttendancesRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }
}

class $$SHGMembershipsTableFilterComposer
    extends Composer<_$AppDatabase, $SHGMembershipsTable> {
  $$SHGMembershipsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get joinedAt => $composableBuilder(
      column: $table.joinedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get role => $composableBuilder(
      column: $table.role, builder: (column) => ColumnFilters(column));

  $$MembersTableFilterComposer get memberId {
    final $$MembersTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.memberId,
        referencedTable: $db.members,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembersTableFilterComposer(
              $db: $db,
              $table: $db.members,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$SHGGroupsTableFilterComposer get groupId {
    final $$SHGGroupsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.groupId,
        referencedTable: $db.sHGGroups,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGGroupsTableFilterComposer(
              $db: $db,
              $table: $db.sHGGroups,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  Expression<bool> sHGSavingsRefs(
      Expression<bool> Function($$SHGSavingsTableFilterComposer f) f) {
    final $$SHGSavingsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGSavings,
        getReferencedColumn: (t) => t.membershipId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGSavingsTableFilterComposer(
              $db: $db,
              $table: $db.sHGSavings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<bool> sHGLoansRefs(
      Expression<bool> Function($$SHGLoansTableFilterComposer f) f) {
    final $$SHGLoansTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGLoans,
        getReferencedColumn: (t) => t.membershipId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGLoansTableFilterComposer(
              $db: $db,
              $table: $db.sHGLoans,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<bool> sHGAttendancesRefs(
      Expression<bool> Function($$SHGAttendancesTableFilterComposer f) f) {
    final $$SHGAttendancesTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGAttendances,
        getReferencedColumn: (t) => t.membershipId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGAttendancesTableFilterComposer(
              $db: $db,
              $table: $db.sHGAttendances,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$SHGMembershipsTableOrderingComposer
    extends Composer<_$AppDatabase, $SHGMembershipsTable> {
  $$SHGMembershipsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get joinedAt => $composableBuilder(
      column: $table.joinedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get role => $composableBuilder(
      column: $table.role, builder: (column) => ColumnOrderings(column));

  $$MembersTableOrderingComposer get memberId {
    final $$MembersTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.memberId,
        referencedTable: $db.members,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembersTableOrderingComposer(
              $db: $db,
              $table: $db.members,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$SHGGroupsTableOrderingComposer get groupId {
    final $$SHGGroupsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.groupId,
        referencedTable: $db.sHGGroups,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGGroupsTableOrderingComposer(
              $db: $db,
              $table: $db.sHGGroups,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SHGMembershipsTableAnnotationComposer
    extends Composer<_$AppDatabase, $SHGMembershipsTable> {
  $$SHGMembershipsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<DateTime> get joinedAt =>
      $composableBuilder(column: $table.joinedAt, builder: (column) => column);

  GeneratedColumn<String> get role =>
      $composableBuilder(column: $table.role, builder: (column) => column);

  $$MembersTableAnnotationComposer get memberId {
    final $$MembersTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.memberId,
        referencedTable: $db.members,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$MembersTableAnnotationComposer(
              $db: $db,
              $table: $db.members,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$SHGGroupsTableAnnotationComposer get groupId {
    final $$SHGGroupsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.groupId,
        referencedTable: $db.sHGGroups,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGGroupsTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGGroups,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  Expression<T> sHGSavingsRefs<T extends Object>(
      Expression<T> Function($$SHGSavingsTableAnnotationComposer a) f) {
    final $$SHGSavingsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGSavings,
        getReferencedColumn: (t) => t.membershipId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGSavingsTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGSavings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<T> sHGLoansRefs<T extends Object>(
      Expression<T> Function($$SHGLoansTableAnnotationComposer a) f) {
    final $$SHGLoansTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGLoans,
        getReferencedColumn: (t) => t.membershipId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGLoansTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGLoans,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<T> sHGAttendancesRefs<T extends Object>(
      Expression<T> Function($$SHGAttendancesTableAnnotationComposer a) f) {
    final $$SHGAttendancesTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGAttendances,
        getReferencedColumn: (t) => t.membershipId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGAttendancesTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGAttendances,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$SHGMembershipsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SHGMembershipsTable,
    SHGMembership,
    $$SHGMembershipsTableFilterComposer,
    $$SHGMembershipsTableOrderingComposer,
    $$SHGMembershipsTableAnnotationComposer,
    $$SHGMembershipsTableCreateCompanionBuilder,
    $$SHGMembershipsTableUpdateCompanionBuilder,
    (SHGMembership, $$SHGMembershipsTableReferences),
    SHGMembership,
    PrefetchHooks Function(
        {bool memberId,
        bool groupId,
        bool sHGSavingsRefs,
        bool sHGLoansRefs,
        bool sHGAttendancesRefs})> {
  $$SHGMembershipsTableTableManager(
      _$AppDatabase db, $SHGMembershipsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SHGMembershipsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SHGMembershipsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SHGMembershipsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int> memberId = const Value.absent(),
            Value<int> groupId = const Value.absent(),
            Value<DateTime> joinedAt = const Value.absent(),
            Value<String> role = const Value.absent(),
          }) =>
              SHGMembershipsCompanion(
            id: id,
            memberId: memberId,
            groupId: groupId,
            joinedAt: joinedAt,
            role: role,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required int memberId,
            required int groupId,
            Value<DateTime> joinedAt = const Value.absent(),
            Value<String> role = const Value.absent(),
          }) =>
              SHGMembershipsCompanion.insert(
            id: id,
            memberId: memberId,
            groupId: groupId,
            joinedAt: joinedAt,
            role: role,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable(table),
                    $$SHGMembershipsTableReferences(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: (
              {memberId = false,
              groupId = false,
              sHGSavingsRefs = false,
              sHGLoansRefs = false,
              sHGAttendancesRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [
                if (sHGSavingsRefs) db.sHGSavings,
                if (sHGLoansRefs) db.sHGLoans,
                if (sHGAttendancesRefs) db.sHGAttendances
              ],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (memberId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.memberId,
                    referencedTable:
                        $$SHGMembershipsTableReferences._memberIdTable(db),
                    referencedColumn:
                        $$SHGMembershipsTableReferences._memberIdTable(db).id,
                  ) as T;
                }
                if (groupId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.groupId,
                    referencedTable:
                        $$SHGMembershipsTableReferences._groupIdTable(db),
                    referencedColumn:
                        $$SHGMembershipsTableReferences._groupIdTable(db).id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [
                  if (sHGSavingsRefs)
                    await $_getPrefetchedData<SHGMembership,
                            $SHGMembershipsTable, SHGSaving>(
                        currentTable: table,
                        referencedTable: $$SHGMembershipsTableReferences
                            ._sHGSavingsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$SHGMembershipsTableReferences(db, table, p0)
                                .sHGSavingsRefs,
                        referencedItemsForCurrentItem:
                            (item, referencedItems) => referencedItems
                                .where((e) => e.membershipId == item.id),
                        typedResults: items),
                  if (sHGLoansRefs)
                    await $_getPrefetchedData<SHGMembership,
                            $SHGMembershipsTable, SHGLoan>(
                        currentTable: table,
                        referencedTable: $$SHGMembershipsTableReferences
                            ._sHGLoansRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$SHGMembershipsTableReferences(db, table, p0)
                                .sHGLoansRefs,
                        referencedItemsForCurrentItem:
                            (item, referencedItems) => referencedItems
                                .where((e) => e.membershipId == item.id),
                        typedResults: items),
                  if (sHGAttendancesRefs)
                    await $_getPrefetchedData<SHGMembership,
                            $SHGMembershipsTable, SHGAttendance>(
                        currentTable: table,
                        referencedTable: $$SHGMembershipsTableReferences
                            ._sHGAttendancesRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$SHGMembershipsTableReferences(db, table, p0)
                                .sHGAttendancesRefs,
                        referencedItemsForCurrentItem:
                            (item, referencedItems) => referencedItems
                                .where((e) => e.membershipId == item.id),
                        typedResults: items)
                ];
              },
            );
          },
        ));
}

typedef $$SHGMembershipsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SHGMembershipsTable,
    SHGMembership,
    $$SHGMembershipsTableFilterComposer,
    $$SHGMembershipsTableOrderingComposer,
    $$SHGMembershipsTableAnnotationComposer,
    $$SHGMembershipsTableCreateCompanionBuilder,
    $$SHGMembershipsTableUpdateCompanionBuilder,
    (SHGMembership, $$SHGMembershipsTableReferences),
    SHGMembership,
    PrefetchHooks Function(
        {bool memberId,
        bool groupId,
        bool sHGSavingsRefs,
        bool sHGLoansRefs,
        bool sHGAttendancesRefs})>;
typedef $$SHGMeetingsTableCreateCompanionBuilder = SHGMeetingsCompanion
    Function({
  Value<int> id,
  required int groupId,
  required DateTime meetingDate,
  Value<String?> resolutionNote,
  Value<String?> conductedBy,
});
typedef $$SHGMeetingsTableUpdateCompanionBuilder = SHGMeetingsCompanion
    Function({
  Value<int> id,
  Value<int> groupId,
  Value<DateTime> meetingDate,
  Value<String?> resolutionNote,
  Value<String?> conductedBy,
});

final class $$SHGMeetingsTableReferences
    extends BaseReferences<_$AppDatabase, $SHGMeetingsTable, SHGMeeting> {
  $$SHGMeetingsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $SHGGroupsTable _groupIdTable(_$AppDatabase db) =>
      db.sHGGroups.createAlias('s_h_g_meetings__group_id__s_h_g_groups__id');

  $$SHGGroupsTableProcessedTableManager get groupId {
    final $_column = $_itemColumn<int>('group_id')!;

    final manager = $$SHGGroupsTableTableManager($_db, $_db.sHGGroups)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_groupIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static MultiTypedResultKey<$SHGSavingsTable, List<SHGSaving>>
      _sHGSavingsRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.sHGSavings,
              aliasName: 's_h_g_meetings__id__s_h_g_savings__meeting_id');

  $$SHGSavingsTableProcessedTableManager get sHGSavingsRefs {
    final manager = $$SHGSavingsTableTableManager($_db, $_db.sHGSavings)
        .filter((f) => f.meetingId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_sHGSavingsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }

  static MultiTypedResultKey<$SHGLoanRepaymentsTable, List<SHGLoanRepayment>>
      _sHGLoanRepaymentsRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.sHGLoanRepayments,
              aliasName:
                  's_h_g_meetings__id__s_h_g_loan_repayments__meeting_id');

  $$SHGLoanRepaymentsTableProcessedTableManager get sHGLoanRepaymentsRefs {
    final manager =
        $$SHGLoanRepaymentsTableTableManager($_db, $_db.sHGLoanRepayments)
            .filter((f) => f.meetingId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache =
        $_typedResult.readTableOrNull(_sHGLoanRepaymentsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }

  static MultiTypedResultKey<$SHGAttendancesTable, List<SHGAttendance>>
      _sHGAttendancesRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.sHGAttendances,
              aliasName: 's_h_g_meetings__id__s_h_g_attendances__meeting_id');

  $$SHGAttendancesTableProcessedTableManager get sHGAttendancesRefs {
    final manager = $$SHGAttendancesTableTableManager($_db, $_db.sHGAttendances)
        .filter((f) => f.meetingId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_sHGAttendancesRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }
}

class $$SHGMeetingsTableFilterComposer
    extends Composer<_$AppDatabase, $SHGMeetingsTable> {
  $$SHGMeetingsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get meetingDate => $composableBuilder(
      column: $table.meetingDate, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get resolutionNote => $composableBuilder(
      column: $table.resolutionNote,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get conductedBy => $composableBuilder(
      column: $table.conductedBy, builder: (column) => ColumnFilters(column));

  $$SHGGroupsTableFilterComposer get groupId {
    final $$SHGGroupsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.groupId,
        referencedTable: $db.sHGGroups,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGGroupsTableFilterComposer(
              $db: $db,
              $table: $db.sHGGroups,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  Expression<bool> sHGSavingsRefs(
      Expression<bool> Function($$SHGSavingsTableFilterComposer f) f) {
    final $$SHGSavingsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGSavings,
        getReferencedColumn: (t) => t.meetingId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGSavingsTableFilterComposer(
              $db: $db,
              $table: $db.sHGSavings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<bool> sHGLoanRepaymentsRefs(
      Expression<bool> Function($$SHGLoanRepaymentsTableFilterComposer f) f) {
    final $$SHGLoanRepaymentsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGLoanRepayments,
        getReferencedColumn: (t) => t.meetingId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGLoanRepaymentsTableFilterComposer(
              $db: $db,
              $table: $db.sHGLoanRepayments,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<bool> sHGAttendancesRefs(
      Expression<bool> Function($$SHGAttendancesTableFilterComposer f) f) {
    final $$SHGAttendancesTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGAttendances,
        getReferencedColumn: (t) => t.meetingId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGAttendancesTableFilterComposer(
              $db: $db,
              $table: $db.sHGAttendances,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$SHGMeetingsTableOrderingComposer
    extends Composer<_$AppDatabase, $SHGMeetingsTable> {
  $$SHGMeetingsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get meetingDate => $composableBuilder(
      column: $table.meetingDate, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get resolutionNote => $composableBuilder(
      column: $table.resolutionNote,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get conductedBy => $composableBuilder(
      column: $table.conductedBy, builder: (column) => ColumnOrderings(column));

  $$SHGGroupsTableOrderingComposer get groupId {
    final $$SHGGroupsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.groupId,
        referencedTable: $db.sHGGroups,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGGroupsTableOrderingComposer(
              $db: $db,
              $table: $db.sHGGroups,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SHGMeetingsTableAnnotationComposer
    extends Composer<_$AppDatabase, $SHGMeetingsTable> {
  $$SHGMeetingsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<DateTime> get meetingDate => $composableBuilder(
      column: $table.meetingDate, builder: (column) => column);

  GeneratedColumn<String> get resolutionNote => $composableBuilder(
      column: $table.resolutionNote, builder: (column) => column);

  GeneratedColumn<String> get conductedBy => $composableBuilder(
      column: $table.conductedBy, builder: (column) => column);

  $$SHGGroupsTableAnnotationComposer get groupId {
    final $$SHGGroupsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.groupId,
        referencedTable: $db.sHGGroups,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGGroupsTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGGroups,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  Expression<T> sHGSavingsRefs<T extends Object>(
      Expression<T> Function($$SHGSavingsTableAnnotationComposer a) f) {
    final $$SHGSavingsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGSavings,
        getReferencedColumn: (t) => t.meetingId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGSavingsTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGSavings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<T> sHGLoanRepaymentsRefs<T extends Object>(
      Expression<T> Function($$SHGLoanRepaymentsTableAnnotationComposer a) f) {
    final $$SHGLoanRepaymentsTableAnnotationComposer composer =
        $composerBuilder(
            composer: this,
            getCurrentColumn: (t) => t.id,
            referencedTable: $db.sHGLoanRepayments,
            getReferencedColumn: (t) => t.meetingId,
            builder: (joinBuilder,
                    {$addJoinBuilderToRootComposer,
                    $removeJoinBuilderFromRootComposer}) =>
                $$SHGLoanRepaymentsTableAnnotationComposer(
                  $db: $db,
                  $table: $db.sHGLoanRepayments,
                  $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
                  joinBuilder: joinBuilder,
                  $removeJoinBuilderFromRootComposer:
                      $removeJoinBuilderFromRootComposer,
                ));
    return f(composer);
  }

  Expression<T> sHGAttendancesRefs<T extends Object>(
      Expression<T> Function($$SHGAttendancesTableAnnotationComposer a) f) {
    final $$SHGAttendancesTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGAttendances,
        getReferencedColumn: (t) => t.meetingId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGAttendancesTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGAttendances,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$SHGMeetingsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SHGMeetingsTable,
    SHGMeeting,
    $$SHGMeetingsTableFilterComposer,
    $$SHGMeetingsTableOrderingComposer,
    $$SHGMeetingsTableAnnotationComposer,
    $$SHGMeetingsTableCreateCompanionBuilder,
    $$SHGMeetingsTableUpdateCompanionBuilder,
    (SHGMeeting, $$SHGMeetingsTableReferences),
    SHGMeeting,
    PrefetchHooks Function(
        {bool groupId,
        bool sHGSavingsRefs,
        bool sHGLoanRepaymentsRefs,
        bool sHGAttendancesRefs})> {
  $$SHGMeetingsTableTableManager(_$AppDatabase db, $SHGMeetingsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SHGMeetingsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SHGMeetingsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SHGMeetingsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int> groupId = const Value.absent(),
            Value<DateTime> meetingDate = const Value.absent(),
            Value<String?> resolutionNote = const Value.absent(),
            Value<String?> conductedBy = const Value.absent(),
          }) =>
              SHGMeetingsCompanion(
            id: id,
            groupId: groupId,
            meetingDate: meetingDate,
            resolutionNote: resolutionNote,
            conductedBy: conductedBy,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required int groupId,
            required DateTime meetingDate,
            Value<String?> resolutionNote = const Value.absent(),
            Value<String?> conductedBy = const Value.absent(),
          }) =>
              SHGMeetingsCompanion.insert(
            id: id,
            groupId: groupId,
            meetingDate: meetingDate,
            resolutionNote: resolutionNote,
            conductedBy: conductedBy,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable(table),
                    $$SHGMeetingsTableReferences(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: (
              {groupId = false,
              sHGSavingsRefs = false,
              sHGLoanRepaymentsRefs = false,
              sHGAttendancesRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [
                if (sHGSavingsRefs) db.sHGSavings,
                if (sHGLoanRepaymentsRefs) db.sHGLoanRepayments,
                if (sHGAttendancesRefs) db.sHGAttendances
              ],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (groupId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.groupId,
                    referencedTable:
                        $$SHGMeetingsTableReferences._groupIdTable(db),
                    referencedColumn:
                        $$SHGMeetingsTableReferences._groupIdTable(db).id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [
                  if (sHGSavingsRefs)
                    await $_getPrefetchedData<SHGMeeting, $SHGMeetingsTable,
                            SHGSaving>(
                        currentTable: table,
                        referencedTable: $$SHGMeetingsTableReferences
                            ._sHGSavingsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$SHGMeetingsTableReferences(db, table, p0)
                                .sHGSavingsRefs,
                        referencedItemsForCurrentItem:
                            (item, referencedItems) => referencedItems
                                .where((e) => e.meetingId == item.id),
                        typedResults: items),
                  if (sHGLoanRepaymentsRefs)
                    await $_getPrefetchedData<SHGMeeting, $SHGMeetingsTable,
                            SHGLoanRepayment>(
                        currentTable: table,
                        referencedTable: $$SHGMeetingsTableReferences
                            ._sHGLoanRepaymentsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$SHGMeetingsTableReferences(db, table, p0)
                                .sHGLoanRepaymentsRefs,
                        referencedItemsForCurrentItem:
                            (item, referencedItems) => referencedItems
                                .where((e) => e.meetingId == item.id),
                        typedResults: items),
                  if (sHGAttendancesRefs)
                    await $_getPrefetchedData<SHGMeeting, $SHGMeetingsTable,
                            SHGAttendance>(
                        currentTable: table,
                        referencedTable: $$SHGMeetingsTableReferences
                            ._sHGAttendancesRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$SHGMeetingsTableReferences(db, table, p0)
                                .sHGAttendancesRefs,
                        referencedItemsForCurrentItem:
                            (item, referencedItems) => referencedItems
                                .where((e) => e.meetingId == item.id),
                        typedResults: items)
                ];
              },
            );
          },
        ));
}

typedef $$SHGMeetingsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SHGMeetingsTable,
    SHGMeeting,
    $$SHGMeetingsTableFilterComposer,
    $$SHGMeetingsTableOrderingComposer,
    $$SHGMeetingsTableAnnotationComposer,
    $$SHGMeetingsTableCreateCompanionBuilder,
    $$SHGMeetingsTableUpdateCompanionBuilder,
    (SHGMeeting, $$SHGMeetingsTableReferences),
    SHGMeeting,
    PrefetchHooks Function(
        {bool groupId,
        bool sHGSavingsRefs,
        bool sHGLoanRepaymentsRefs,
        bool sHGAttendancesRefs})>;
typedef $$SHGSavingsTableCreateCompanionBuilder = SHGSavingsCompanion Function({
  Value<int> id,
  required int membershipId,
  Value<int?> meetingId,
  required double amount,
  Value<DateTime> date,
});
typedef $$SHGSavingsTableUpdateCompanionBuilder = SHGSavingsCompanion Function({
  Value<int> id,
  Value<int> membershipId,
  Value<int?> meetingId,
  Value<double> amount,
  Value<DateTime> date,
});

final class $$SHGSavingsTableReferences
    extends BaseReferences<_$AppDatabase, $SHGSavingsTable, SHGSaving> {
  $$SHGSavingsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $SHGMembershipsTable _membershipIdTable(_$AppDatabase db) =>
      db.sHGMemberships
          .createAlias('s_h_g_savings__membership_id__s_h_g_memberships__id');

  $$SHGMembershipsTableProcessedTableManager get membershipId {
    final $_column = $_itemColumn<int>('membership_id')!;

    final manager = $$SHGMembershipsTableTableManager($_db, $_db.sHGMemberships)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_membershipIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static $SHGMeetingsTable _meetingIdTable(_$AppDatabase db) => db.sHGMeetings
      .createAlias('s_h_g_savings__meeting_id__s_h_g_meetings__id');

  $$SHGMeetingsTableProcessedTableManager? get meetingId {
    final $_column = $_itemColumn<int>('meeting_id');
    if ($_column == null) return null;
    final manager = $$SHGMeetingsTableTableManager($_db, $_db.sHGMeetings)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_meetingIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }
}

class $$SHGSavingsTableFilterComposer
    extends Composer<_$AppDatabase, $SHGSavingsTable> {
  $$SHGSavingsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get amount => $composableBuilder(
      column: $table.amount, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get date => $composableBuilder(
      column: $table.date, builder: (column) => ColumnFilters(column));

  $$SHGMembershipsTableFilterComposer get membershipId {
    final $$SHGMembershipsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.membershipId,
        referencedTable: $db.sHGMemberships,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMembershipsTableFilterComposer(
              $db: $db,
              $table: $db.sHGMemberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$SHGMeetingsTableFilterComposer get meetingId {
    final $$SHGMeetingsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.meetingId,
        referencedTable: $db.sHGMeetings,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMeetingsTableFilterComposer(
              $db: $db,
              $table: $db.sHGMeetings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SHGSavingsTableOrderingComposer
    extends Composer<_$AppDatabase, $SHGSavingsTable> {
  $$SHGSavingsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get amount => $composableBuilder(
      column: $table.amount, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get date => $composableBuilder(
      column: $table.date, builder: (column) => ColumnOrderings(column));

  $$SHGMembershipsTableOrderingComposer get membershipId {
    final $$SHGMembershipsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.membershipId,
        referencedTable: $db.sHGMemberships,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMembershipsTableOrderingComposer(
              $db: $db,
              $table: $db.sHGMemberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$SHGMeetingsTableOrderingComposer get meetingId {
    final $$SHGMeetingsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.meetingId,
        referencedTable: $db.sHGMeetings,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMeetingsTableOrderingComposer(
              $db: $db,
              $table: $db.sHGMeetings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SHGSavingsTableAnnotationComposer
    extends Composer<_$AppDatabase, $SHGSavingsTable> {
  $$SHGSavingsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<double> get amount =>
      $composableBuilder(column: $table.amount, builder: (column) => column);

  GeneratedColumn<DateTime> get date =>
      $composableBuilder(column: $table.date, builder: (column) => column);

  $$SHGMembershipsTableAnnotationComposer get membershipId {
    final $$SHGMembershipsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.membershipId,
        referencedTable: $db.sHGMemberships,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMembershipsTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGMemberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$SHGMeetingsTableAnnotationComposer get meetingId {
    final $$SHGMeetingsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.meetingId,
        referencedTable: $db.sHGMeetings,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMeetingsTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGMeetings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SHGSavingsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SHGSavingsTable,
    SHGSaving,
    $$SHGSavingsTableFilterComposer,
    $$SHGSavingsTableOrderingComposer,
    $$SHGSavingsTableAnnotationComposer,
    $$SHGSavingsTableCreateCompanionBuilder,
    $$SHGSavingsTableUpdateCompanionBuilder,
    (SHGSaving, $$SHGSavingsTableReferences),
    SHGSaving,
    PrefetchHooks Function({bool membershipId, bool meetingId})> {
  $$SHGSavingsTableTableManager(_$AppDatabase db, $SHGSavingsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SHGSavingsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SHGSavingsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SHGSavingsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int> membershipId = const Value.absent(),
            Value<int?> meetingId = const Value.absent(),
            Value<double> amount = const Value.absent(),
            Value<DateTime> date = const Value.absent(),
          }) =>
              SHGSavingsCompanion(
            id: id,
            membershipId: membershipId,
            meetingId: meetingId,
            amount: amount,
            date: date,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required int membershipId,
            Value<int?> meetingId = const Value.absent(),
            required double amount,
            Value<DateTime> date = const Value.absent(),
          }) =>
              SHGSavingsCompanion.insert(
            id: id,
            membershipId: membershipId,
            meetingId: meetingId,
            amount: amount,
            date: date,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable(table),
                    $$SHGSavingsTableReferences(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: ({membershipId = false, meetingId = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (membershipId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.membershipId,
                    referencedTable:
                        $$SHGSavingsTableReferences._membershipIdTable(db),
                    referencedColumn:
                        $$SHGSavingsTableReferences._membershipIdTable(db).id,
                  ) as T;
                }
                if (meetingId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.meetingId,
                    referencedTable:
                        $$SHGSavingsTableReferences._meetingIdTable(db),
                    referencedColumn:
                        $$SHGSavingsTableReferences._meetingIdTable(db).id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [];
              },
            );
          },
        ));
}

typedef $$SHGSavingsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SHGSavingsTable,
    SHGSaving,
    $$SHGSavingsTableFilterComposer,
    $$SHGSavingsTableOrderingComposer,
    $$SHGSavingsTableAnnotationComposer,
    $$SHGSavingsTableCreateCompanionBuilder,
    $$SHGSavingsTableUpdateCompanionBuilder,
    (SHGSaving, $$SHGSavingsTableReferences),
    SHGSaving,
    PrefetchHooks Function({bool membershipId, bool meetingId})>;
typedef $$SHGLoansTableCreateCompanionBuilder = SHGLoansCompanion Function({
  Value<int> id,
  required int membershipId,
  required String principalAmount,
  required String interestRate,
  required DateTime loanDate,
  required int durationMonths,
  Value<String?> purpose,
  Value<String> status,
});
typedef $$SHGLoansTableUpdateCompanionBuilder = SHGLoansCompanion Function({
  Value<int> id,
  Value<int> membershipId,
  Value<String> principalAmount,
  Value<String> interestRate,
  Value<DateTime> loanDate,
  Value<int> durationMonths,
  Value<String?> purpose,
  Value<String> status,
});

final class $$SHGLoansTableReferences
    extends BaseReferences<_$AppDatabase, $SHGLoansTable, SHGLoan> {
  $$SHGLoansTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $SHGMembershipsTable _membershipIdTable(_$AppDatabase db) =>
      db.sHGMemberships
          .createAlias('s_h_g_loans__membership_id__s_h_g_memberships__id');

  $$SHGMembershipsTableProcessedTableManager get membershipId {
    final $_column = $_itemColumn<int>('membership_id')!;

    final manager = $$SHGMembershipsTableTableManager($_db, $_db.sHGMemberships)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_membershipIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static MultiTypedResultKey<$SHGLoanRepaymentsTable, List<SHGLoanRepayment>>
      _sHGLoanRepaymentsRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.sHGLoanRepayments,
              aliasName: 's_h_g_loans__id__s_h_g_loan_repayments__loan_id');

  $$SHGLoanRepaymentsTableProcessedTableManager get sHGLoanRepaymentsRefs {
    final manager =
        $$SHGLoanRepaymentsTableTableManager($_db, $_db.sHGLoanRepayments)
            .filter((f) => f.loanId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache =
        $_typedResult.readTableOrNull(_sHGLoanRepaymentsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }
}

class $$SHGLoansTableFilterComposer
    extends Composer<_$AppDatabase, $SHGLoansTable> {
  $$SHGLoansTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get principalAmount => $composableBuilder(
      column: $table.principalAmount,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get interestRate => $composableBuilder(
      column: $table.interestRate, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get loanDate => $composableBuilder(
      column: $table.loanDate, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get durationMonths => $composableBuilder(
      column: $table.durationMonths,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get purpose => $composableBuilder(
      column: $table.purpose, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  $$SHGMembershipsTableFilterComposer get membershipId {
    final $$SHGMembershipsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.membershipId,
        referencedTable: $db.sHGMemberships,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMembershipsTableFilterComposer(
              $db: $db,
              $table: $db.sHGMemberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  Expression<bool> sHGLoanRepaymentsRefs(
      Expression<bool> Function($$SHGLoanRepaymentsTableFilterComposer f) f) {
    final $$SHGLoanRepaymentsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sHGLoanRepayments,
        getReferencedColumn: (t) => t.loanId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGLoanRepaymentsTableFilterComposer(
              $db: $db,
              $table: $db.sHGLoanRepayments,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$SHGLoansTableOrderingComposer
    extends Composer<_$AppDatabase, $SHGLoansTable> {
  $$SHGLoansTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get principalAmount => $composableBuilder(
      column: $table.principalAmount,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get interestRate => $composableBuilder(
      column: $table.interestRate,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get loanDate => $composableBuilder(
      column: $table.loanDate, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get durationMonths => $composableBuilder(
      column: $table.durationMonths,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get purpose => $composableBuilder(
      column: $table.purpose, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  $$SHGMembershipsTableOrderingComposer get membershipId {
    final $$SHGMembershipsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.membershipId,
        referencedTable: $db.sHGMemberships,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMembershipsTableOrderingComposer(
              $db: $db,
              $table: $db.sHGMemberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SHGLoansTableAnnotationComposer
    extends Composer<_$AppDatabase, $SHGLoansTable> {
  $$SHGLoansTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get principalAmount => $composableBuilder(
      column: $table.principalAmount, builder: (column) => column);

  GeneratedColumn<String> get interestRate => $composableBuilder(
      column: $table.interestRate, builder: (column) => column);

  GeneratedColumn<DateTime> get loanDate =>
      $composableBuilder(column: $table.loanDate, builder: (column) => column);

  GeneratedColumn<int> get durationMonths => $composableBuilder(
      column: $table.durationMonths, builder: (column) => column);

  GeneratedColumn<String> get purpose =>
      $composableBuilder(column: $table.purpose, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  $$SHGMembershipsTableAnnotationComposer get membershipId {
    final $$SHGMembershipsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.membershipId,
        referencedTable: $db.sHGMemberships,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMembershipsTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGMemberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  Expression<T> sHGLoanRepaymentsRefs<T extends Object>(
      Expression<T> Function($$SHGLoanRepaymentsTableAnnotationComposer a) f) {
    final $$SHGLoanRepaymentsTableAnnotationComposer composer =
        $composerBuilder(
            composer: this,
            getCurrentColumn: (t) => t.id,
            referencedTable: $db.sHGLoanRepayments,
            getReferencedColumn: (t) => t.loanId,
            builder: (joinBuilder,
                    {$addJoinBuilderToRootComposer,
                    $removeJoinBuilderFromRootComposer}) =>
                $$SHGLoanRepaymentsTableAnnotationComposer(
                  $db: $db,
                  $table: $db.sHGLoanRepayments,
                  $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
                  joinBuilder: joinBuilder,
                  $removeJoinBuilderFromRootComposer:
                      $removeJoinBuilderFromRootComposer,
                ));
    return f(composer);
  }
}

class $$SHGLoansTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SHGLoansTable,
    SHGLoan,
    $$SHGLoansTableFilterComposer,
    $$SHGLoansTableOrderingComposer,
    $$SHGLoansTableAnnotationComposer,
    $$SHGLoansTableCreateCompanionBuilder,
    $$SHGLoansTableUpdateCompanionBuilder,
    (SHGLoan, $$SHGLoansTableReferences),
    SHGLoan,
    PrefetchHooks Function({bool membershipId, bool sHGLoanRepaymentsRefs})> {
  $$SHGLoansTableTableManager(_$AppDatabase db, $SHGLoansTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SHGLoansTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SHGLoansTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SHGLoansTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int> membershipId = const Value.absent(),
            Value<String> principalAmount = const Value.absent(),
            Value<String> interestRate = const Value.absent(),
            Value<DateTime> loanDate = const Value.absent(),
            Value<int> durationMonths = const Value.absent(),
            Value<String?> purpose = const Value.absent(),
            Value<String> status = const Value.absent(),
          }) =>
              SHGLoansCompanion(
            id: id,
            membershipId: membershipId,
            principalAmount: principalAmount,
            interestRate: interestRate,
            loanDate: loanDate,
            durationMonths: durationMonths,
            purpose: purpose,
            status: status,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required int membershipId,
            required String principalAmount,
            required String interestRate,
            required DateTime loanDate,
            required int durationMonths,
            Value<String?> purpose = const Value.absent(),
            Value<String> status = const Value.absent(),
          }) =>
              SHGLoansCompanion.insert(
            id: id,
            membershipId: membershipId,
            principalAmount: principalAmount,
            interestRate: interestRate,
            loanDate: loanDate,
            durationMonths: durationMonths,
            purpose: purpose,
            status: status,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) =>
                  (e.readTable(table), $$SHGLoansTableReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: (
              {membershipId = false, sHGLoanRepaymentsRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [
                if (sHGLoanRepaymentsRefs) db.sHGLoanRepayments
              ],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (membershipId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.membershipId,
                    referencedTable:
                        $$SHGLoansTableReferences._membershipIdTable(db),
                    referencedColumn:
                        $$SHGLoansTableReferences._membershipIdTable(db).id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [
                  if (sHGLoanRepaymentsRefs)
                    await $_getPrefetchedData<SHGLoan, $SHGLoansTable,
                            SHGLoanRepayment>(
                        currentTable: table,
                        referencedTable: $$SHGLoansTableReferences
                            ._sHGLoanRepaymentsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$SHGLoansTableReferences(db, table, p0)
                                .sHGLoanRepaymentsRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.loanId == item.id),
                        typedResults: items)
                ];
              },
            );
          },
        ));
}

typedef $$SHGLoansTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SHGLoansTable,
    SHGLoan,
    $$SHGLoansTableFilterComposer,
    $$SHGLoansTableOrderingComposer,
    $$SHGLoansTableAnnotationComposer,
    $$SHGLoansTableCreateCompanionBuilder,
    $$SHGLoansTableUpdateCompanionBuilder,
    (SHGLoan, $$SHGLoansTableReferences),
    SHGLoan,
    PrefetchHooks Function({bool membershipId, bool sHGLoanRepaymentsRefs})>;
typedef $$SHGLoanRepaymentsTableCreateCompanionBuilder
    = SHGLoanRepaymentsCompanion Function({
  Value<int> id,
  required int loanId,
  Value<int?> meetingId,
  required String principalPaid,
  required String interestPaid,
  Value<DateTime> date,
});
typedef $$SHGLoanRepaymentsTableUpdateCompanionBuilder
    = SHGLoanRepaymentsCompanion Function({
  Value<int> id,
  Value<int> loanId,
  Value<int?> meetingId,
  Value<String> principalPaid,
  Value<String> interestPaid,
  Value<DateTime> date,
});

final class $$SHGLoanRepaymentsTableReferences extends BaseReferences<
    _$AppDatabase, $SHGLoanRepaymentsTable, SHGLoanRepayment> {
  $$SHGLoanRepaymentsTableReferences(
      super.$_db, super.$_table, super.$_typedResult);

  static $SHGLoansTable _loanIdTable(_$AppDatabase db) => db.sHGLoans
      .createAlias('s_h_g_loan_repayments__loan_id__s_h_g_loans__id');

  $$SHGLoansTableProcessedTableManager get loanId {
    final $_column = $_itemColumn<int>('loan_id')!;

    final manager = $$SHGLoansTableTableManager($_db, $_db.sHGLoans)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_loanIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static $SHGMeetingsTable _meetingIdTable(_$AppDatabase db) => db.sHGMeetings
      .createAlias('s_h_g_loan_repayments__meeting_id__s_h_g_meetings__id');

  $$SHGMeetingsTableProcessedTableManager? get meetingId {
    final $_column = $_itemColumn<int>('meeting_id');
    if ($_column == null) return null;
    final manager = $$SHGMeetingsTableTableManager($_db, $_db.sHGMeetings)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_meetingIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }
}

class $$SHGLoanRepaymentsTableFilterComposer
    extends Composer<_$AppDatabase, $SHGLoanRepaymentsTable> {
  $$SHGLoanRepaymentsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get principalPaid => $composableBuilder(
      column: $table.principalPaid, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get interestPaid => $composableBuilder(
      column: $table.interestPaid, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get date => $composableBuilder(
      column: $table.date, builder: (column) => ColumnFilters(column));

  $$SHGLoansTableFilterComposer get loanId {
    final $$SHGLoansTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.loanId,
        referencedTable: $db.sHGLoans,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGLoansTableFilterComposer(
              $db: $db,
              $table: $db.sHGLoans,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$SHGMeetingsTableFilterComposer get meetingId {
    final $$SHGMeetingsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.meetingId,
        referencedTable: $db.sHGMeetings,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMeetingsTableFilterComposer(
              $db: $db,
              $table: $db.sHGMeetings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SHGLoanRepaymentsTableOrderingComposer
    extends Composer<_$AppDatabase, $SHGLoanRepaymentsTable> {
  $$SHGLoanRepaymentsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get principalPaid => $composableBuilder(
      column: $table.principalPaid,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get interestPaid => $composableBuilder(
      column: $table.interestPaid,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get date => $composableBuilder(
      column: $table.date, builder: (column) => ColumnOrderings(column));

  $$SHGLoansTableOrderingComposer get loanId {
    final $$SHGLoansTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.loanId,
        referencedTable: $db.sHGLoans,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGLoansTableOrderingComposer(
              $db: $db,
              $table: $db.sHGLoans,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$SHGMeetingsTableOrderingComposer get meetingId {
    final $$SHGMeetingsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.meetingId,
        referencedTable: $db.sHGMeetings,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMeetingsTableOrderingComposer(
              $db: $db,
              $table: $db.sHGMeetings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SHGLoanRepaymentsTableAnnotationComposer
    extends Composer<_$AppDatabase, $SHGLoanRepaymentsTable> {
  $$SHGLoanRepaymentsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get principalPaid => $composableBuilder(
      column: $table.principalPaid, builder: (column) => column);

  GeneratedColumn<String> get interestPaid => $composableBuilder(
      column: $table.interestPaid, builder: (column) => column);

  GeneratedColumn<DateTime> get date =>
      $composableBuilder(column: $table.date, builder: (column) => column);

  $$SHGLoansTableAnnotationComposer get loanId {
    final $$SHGLoansTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.loanId,
        referencedTable: $db.sHGLoans,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGLoansTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGLoans,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$SHGMeetingsTableAnnotationComposer get meetingId {
    final $$SHGMeetingsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.meetingId,
        referencedTable: $db.sHGMeetings,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMeetingsTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGMeetings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SHGLoanRepaymentsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SHGLoanRepaymentsTable,
    SHGLoanRepayment,
    $$SHGLoanRepaymentsTableFilterComposer,
    $$SHGLoanRepaymentsTableOrderingComposer,
    $$SHGLoanRepaymentsTableAnnotationComposer,
    $$SHGLoanRepaymentsTableCreateCompanionBuilder,
    $$SHGLoanRepaymentsTableUpdateCompanionBuilder,
    (SHGLoanRepayment, $$SHGLoanRepaymentsTableReferences),
    SHGLoanRepayment,
    PrefetchHooks Function({bool loanId, bool meetingId})> {
  $$SHGLoanRepaymentsTableTableManager(
      _$AppDatabase db, $SHGLoanRepaymentsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SHGLoanRepaymentsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SHGLoanRepaymentsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SHGLoanRepaymentsTableAnnotationComposer(
                  $db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int> loanId = const Value.absent(),
            Value<int?> meetingId = const Value.absent(),
            Value<String> principalPaid = const Value.absent(),
            Value<String> interestPaid = const Value.absent(),
            Value<DateTime> date = const Value.absent(),
          }) =>
              SHGLoanRepaymentsCompanion(
            id: id,
            loanId: loanId,
            meetingId: meetingId,
            principalPaid: principalPaid,
            interestPaid: interestPaid,
            date: date,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required int loanId,
            Value<int?> meetingId = const Value.absent(),
            required String principalPaid,
            required String interestPaid,
            Value<DateTime> date = const Value.absent(),
          }) =>
              SHGLoanRepaymentsCompanion.insert(
            id: id,
            loanId: loanId,
            meetingId: meetingId,
            principalPaid: principalPaid,
            interestPaid: interestPaid,
            date: date,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable(table),
                    $$SHGLoanRepaymentsTableReferences(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: ({loanId = false, meetingId = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (loanId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.loanId,
                    referencedTable:
                        $$SHGLoanRepaymentsTableReferences._loanIdTable(db),
                    referencedColumn:
                        $$SHGLoanRepaymentsTableReferences._loanIdTable(db).id,
                  ) as T;
                }
                if (meetingId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.meetingId,
                    referencedTable:
                        $$SHGLoanRepaymentsTableReferences._meetingIdTable(db),
                    referencedColumn: $$SHGLoanRepaymentsTableReferences
                        ._meetingIdTable(db)
                        .id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [];
              },
            );
          },
        ));
}

typedef $$SHGLoanRepaymentsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SHGLoanRepaymentsTable,
    SHGLoanRepayment,
    $$SHGLoanRepaymentsTableFilterComposer,
    $$SHGLoanRepaymentsTableOrderingComposer,
    $$SHGLoanRepaymentsTableAnnotationComposer,
    $$SHGLoanRepaymentsTableCreateCompanionBuilder,
    $$SHGLoanRepaymentsTableUpdateCompanionBuilder,
    (SHGLoanRepayment, $$SHGLoanRepaymentsTableReferences),
    SHGLoanRepayment,
    PrefetchHooks Function({bool loanId, bool meetingId})>;
typedef $$SHGAttendancesTableCreateCompanionBuilder = SHGAttendancesCompanion
    Function({
  Value<int> id,
  required int meetingId,
  required int membershipId,
  Value<bool> isPresent,
  Value<double> fineAmount,
});
typedef $$SHGAttendancesTableUpdateCompanionBuilder = SHGAttendancesCompanion
    Function({
  Value<int> id,
  Value<int> meetingId,
  Value<int> membershipId,
  Value<bool> isPresent,
  Value<double> fineAmount,
});

final class $$SHGAttendancesTableReferences
    extends BaseReferences<_$AppDatabase, $SHGAttendancesTable, SHGAttendance> {
  $$SHGAttendancesTableReferences(
      super.$_db, super.$_table, super.$_typedResult);

  static $SHGMeetingsTable _meetingIdTable(_$AppDatabase db) => db.sHGMeetings
      .createAlias('s_h_g_attendances__meeting_id__s_h_g_meetings__id');

  $$SHGMeetingsTableProcessedTableManager get meetingId {
    final $_column = $_itemColumn<int>('meeting_id')!;

    final manager = $$SHGMeetingsTableTableManager($_db, $_db.sHGMeetings)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_meetingIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static $SHGMembershipsTable _membershipIdTable(_$AppDatabase db) => db
      .sHGMemberships
      .createAlias('s_h_g_attendances__membership_id__s_h_g_memberships__id');

  $$SHGMembershipsTableProcessedTableManager get membershipId {
    final $_column = $_itemColumn<int>('membership_id')!;

    final manager = $$SHGMembershipsTableTableManager($_db, $_db.sHGMemberships)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_membershipIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }
}

class $$SHGAttendancesTableFilterComposer
    extends Composer<_$AppDatabase, $SHGAttendancesTable> {
  $$SHGAttendancesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get isPresent => $composableBuilder(
      column: $table.isPresent, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get fineAmount => $composableBuilder(
      column: $table.fineAmount, builder: (column) => ColumnFilters(column));

  $$SHGMeetingsTableFilterComposer get meetingId {
    final $$SHGMeetingsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.meetingId,
        referencedTable: $db.sHGMeetings,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMeetingsTableFilterComposer(
              $db: $db,
              $table: $db.sHGMeetings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$SHGMembershipsTableFilterComposer get membershipId {
    final $$SHGMembershipsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.membershipId,
        referencedTable: $db.sHGMemberships,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMembershipsTableFilterComposer(
              $db: $db,
              $table: $db.sHGMemberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SHGAttendancesTableOrderingComposer
    extends Composer<_$AppDatabase, $SHGAttendancesTable> {
  $$SHGAttendancesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get isPresent => $composableBuilder(
      column: $table.isPresent, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get fineAmount => $composableBuilder(
      column: $table.fineAmount, builder: (column) => ColumnOrderings(column));

  $$SHGMeetingsTableOrderingComposer get meetingId {
    final $$SHGMeetingsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.meetingId,
        referencedTable: $db.sHGMeetings,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMeetingsTableOrderingComposer(
              $db: $db,
              $table: $db.sHGMeetings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$SHGMembershipsTableOrderingComposer get membershipId {
    final $$SHGMembershipsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.membershipId,
        referencedTable: $db.sHGMemberships,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMembershipsTableOrderingComposer(
              $db: $db,
              $table: $db.sHGMemberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SHGAttendancesTableAnnotationComposer
    extends Composer<_$AppDatabase, $SHGAttendancesTable> {
  $$SHGAttendancesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<bool> get isPresent =>
      $composableBuilder(column: $table.isPresent, builder: (column) => column);

  GeneratedColumn<double> get fineAmount => $composableBuilder(
      column: $table.fineAmount, builder: (column) => column);

  $$SHGMeetingsTableAnnotationComposer get meetingId {
    final $$SHGMeetingsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.meetingId,
        referencedTable: $db.sHGMeetings,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMeetingsTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGMeetings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$SHGMembershipsTableAnnotationComposer get membershipId {
    final $$SHGMembershipsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.membershipId,
        referencedTable: $db.sHGMemberships,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGMembershipsTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGMemberships,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SHGAttendancesTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SHGAttendancesTable,
    SHGAttendance,
    $$SHGAttendancesTableFilterComposer,
    $$SHGAttendancesTableOrderingComposer,
    $$SHGAttendancesTableAnnotationComposer,
    $$SHGAttendancesTableCreateCompanionBuilder,
    $$SHGAttendancesTableUpdateCompanionBuilder,
    (SHGAttendance, $$SHGAttendancesTableReferences),
    SHGAttendance,
    PrefetchHooks Function({bool meetingId, bool membershipId})> {
  $$SHGAttendancesTableTableManager(
      _$AppDatabase db, $SHGAttendancesTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SHGAttendancesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SHGAttendancesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SHGAttendancesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int> meetingId = const Value.absent(),
            Value<int> membershipId = const Value.absent(),
            Value<bool> isPresent = const Value.absent(),
            Value<double> fineAmount = const Value.absent(),
          }) =>
              SHGAttendancesCompanion(
            id: id,
            meetingId: meetingId,
            membershipId: membershipId,
            isPresent: isPresent,
            fineAmount: fineAmount,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required int meetingId,
            required int membershipId,
            Value<bool> isPresent = const Value.absent(),
            Value<double> fineAmount = const Value.absent(),
          }) =>
              SHGAttendancesCompanion.insert(
            id: id,
            meetingId: meetingId,
            membershipId: membershipId,
            isPresent: isPresent,
            fineAmount: fineAmount,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable(table),
                    $$SHGAttendancesTableReferences(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: ({meetingId = false, membershipId = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (meetingId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.meetingId,
                    referencedTable:
                        $$SHGAttendancesTableReferences._meetingIdTable(db),
                    referencedColumn:
                        $$SHGAttendancesTableReferences._meetingIdTable(db).id,
                  ) as T;
                }
                if (membershipId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.membershipId,
                    referencedTable:
                        $$SHGAttendancesTableReferences._membershipIdTable(db),
                    referencedColumn: $$SHGAttendancesTableReferences
                        ._membershipIdTable(db)
                        .id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [];
              },
            );
          },
        ));
}

typedef $$SHGAttendancesTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SHGAttendancesTable,
    SHGAttendance,
    $$SHGAttendancesTableFilterComposer,
    $$SHGAttendancesTableOrderingComposer,
    $$SHGAttendancesTableAnnotationComposer,
    $$SHGAttendancesTableCreateCompanionBuilder,
    $$SHGAttendancesTableUpdateCompanionBuilder,
    (SHGAttendance, $$SHGAttendancesTableReferences),
    SHGAttendance,
    PrefetchHooks Function({bool meetingId, bool membershipId})>;
typedef $$SHGCashBooksTableCreateCompanionBuilder = SHGCashBooksCompanion
    Function({
  Value<int> id,
  required int groupId,
  Value<DateTime> date,
  required String transactionType,
  required String category,
  required double amount,
  Value<String?> description,
});
typedef $$SHGCashBooksTableUpdateCompanionBuilder = SHGCashBooksCompanion
    Function({
  Value<int> id,
  Value<int> groupId,
  Value<DateTime> date,
  Value<String> transactionType,
  Value<String> category,
  Value<double> amount,
  Value<String?> description,
});

final class $$SHGCashBooksTableReferences
    extends BaseReferences<_$AppDatabase, $SHGCashBooksTable, SHGCashBook> {
  $$SHGCashBooksTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $SHGGroupsTable _groupIdTable(_$AppDatabase db) =>
      db.sHGGroups.createAlias('s_h_g_cash_books__group_id__s_h_g_groups__id');

  $$SHGGroupsTableProcessedTableManager get groupId {
    final $_column = $_itemColumn<int>('group_id')!;

    final manager = $$SHGGroupsTableTableManager($_db, $_db.sHGGroups)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_groupIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }
}

class $$SHGCashBooksTableFilterComposer
    extends Composer<_$AppDatabase, $SHGCashBooksTable> {
  $$SHGCashBooksTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get date => $composableBuilder(
      column: $table.date, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get transactionType => $composableBuilder(
      column: $table.transactionType,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get category => $composableBuilder(
      column: $table.category, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get amount => $composableBuilder(
      column: $table.amount, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnFilters(column));

  $$SHGGroupsTableFilterComposer get groupId {
    final $$SHGGroupsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.groupId,
        referencedTable: $db.sHGGroups,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGGroupsTableFilterComposer(
              $db: $db,
              $table: $db.sHGGroups,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SHGCashBooksTableOrderingComposer
    extends Composer<_$AppDatabase, $SHGCashBooksTable> {
  $$SHGCashBooksTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get date => $composableBuilder(
      column: $table.date, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get transactionType => $composableBuilder(
      column: $table.transactionType,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get category => $composableBuilder(
      column: $table.category, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get amount => $composableBuilder(
      column: $table.amount, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnOrderings(column));

  $$SHGGroupsTableOrderingComposer get groupId {
    final $$SHGGroupsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.groupId,
        referencedTable: $db.sHGGroups,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGGroupsTableOrderingComposer(
              $db: $db,
              $table: $db.sHGGroups,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SHGCashBooksTableAnnotationComposer
    extends Composer<_$AppDatabase, $SHGCashBooksTable> {
  $$SHGCashBooksTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<DateTime> get date =>
      $composableBuilder(column: $table.date, builder: (column) => column);

  GeneratedColumn<String> get transactionType => $composableBuilder(
      column: $table.transactionType, builder: (column) => column);

  GeneratedColumn<String> get category =>
      $composableBuilder(column: $table.category, builder: (column) => column);

  GeneratedColumn<double> get amount =>
      $composableBuilder(column: $table.amount, builder: (column) => column);

  GeneratedColumn<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => column);

  $$SHGGroupsTableAnnotationComposer get groupId {
    final $$SHGGroupsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.groupId,
        referencedTable: $db.sHGGroups,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SHGGroupsTableAnnotationComposer(
              $db: $db,
              $table: $db.sHGGroups,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SHGCashBooksTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SHGCashBooksTable,
    SHGCashBook,
    $$SHGCashBooksTableFilterComposer,
    $$SHGCashBooksTableOrderingComposer,
    $$SHGCashBooksTableAnnotationComposer,
    $$SHGCashBooksTableCreateCompanionBuilder,
    $$SHGCashBooksTableUpdateCompanionBuilder,
    (SHGCashBook, $$SHGCashBooksTableReferences),
    SHGCashBook,
    PrefetchHooks Function({bool groupId})> {
  $$SHGCashBooksTableTableManager(_$AppDatabase db, $SHGCashBooksTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SHGCashBooksTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SHGCashBooksTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SHGCashBooksTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int> groupId = const Value.absent(),
            Value<DateTime> date = const Value.absent(),
            Value<String> transactionType = const Value.absent(),
            Value<String> category = const Value.absent(),
            Value<double> amount = const Value.absent(),
            Value<String?> description = const Value.absent(),
          }) =>
              SHGCashBooksCompanion(
            id: id,
            groupId: groupId,
            date: date,
            transactionType: transactionType,
            category: category,
            amount: amount,
            description: description,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required int groupId,
            Value<DateTime> date = const Value.absent(),
            required String transactionType,
            required String category,
            required double amount,
            Value<String?> description = const Value.absent(),
          }) =>
              SHGCashBooksCompanion.insert(
            id: id,
            groupId: groupId,
            date: date,
            transactionType: transactionType,
            category: category,
            amount: amount,
            description: description,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable(table),
                    $$SHGCashBooksTableReferences(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: ({groupId = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (groupId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.groupId,
                    referencedTable:
                        $$SHGCashBooksTableReferences._groupIdTable(db),
                    referencedColumn:
                        $$SHGCashBooksTableReferences._groupIdTable(db).id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [];
              },
            );
          },
        ));
}

typedef $$SHGCashBooksTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SHGCashBooksTable,
    SHGCashBook,
    $$SHGCashBooksTableFilterComposer,
    $$SHGCashBooksTableOrderingComposer,
    $$SHGCashBooksTableAnnotationComposer,
    $$SHGCashBooksTableCreateCompanionBuilder,
    $$SHGCashBooksTableUpdateCompanionBuilder,
    (SHGCashBook, $$SHGCashBooksTableReferences),
    SHGCashBook,
    PrefetchHooks Function({bool groupId})>;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$MembersTableTableManager get members =>
      $$MembersTableTableManager(_db, _db.members);
  $$GroupsTableTableManager get groups =>
      $$GroupsTableTableManager(_db, _db.groups);
  $$MembershipsTableTableManager get memberships =>
      $$MembershipsTableTableManager(_db, _db.memberships);
  $$RoundsTableTableManager get rounds =>
      $$RoundsTableTableManager(_db, _db.rounds);
  $$PaymentsTableTableManager get payments =>
      $$PaymentsTableTableManager(_db, _db.payments);
  $$AdminSettingsTableTableManager get adminSettings =>
      $$AdminSettingsTableTableManager(_db, _db.adminSettings);
  $$AuditLogsTableTableManager get auditLogs =>
      $$AuditLogsTableTableManager(_db, _db.auditLogs);
  $$SHGGroupsTableTableManager get sHGGroups =>
      $$SHGGroupsTableTableManager(_db, _db.sHGGroups);
  $$SHGMembershipsTableTableManager get sHGMemberships =>
      $$SHGMembershipsTableTableManager(_db, _db.sHGMemberships);
  $$SHGMeetingsTableTableManager get sHGMeetings =>
      $$SHGMeetingsTableTableManager(_db, _db.sHGMeetings);
  $$SHGSavingsTableTableManager get sHGSavings =>
      $$SHGSavingsTableTableManager(_db, _db.sHGSavings);
  $$SHGLoansTableTableManager get sHGLoans =>
      $$SHGLoansTableTableManager(_db, _db.sHGLoans);
  $$SHGLoanRepaymentsTableTableManager get sHGLoanRepayments =>
      $$SHGLoanRepaymentsTableTableManager(_db, _db.sHGLoanRepayments);
  $$SHGAttendancesTableTableManager get sHGAttendances =>
      $$SHGAttendancesTableTableManager(_db, _db.sHGAttendances);
  $$SHGCashBooksTableTableManager get sHGCashBooks =>
      $$SHGCashBooksTableTableManager(_db, _db.sHGCashBooks);
}
