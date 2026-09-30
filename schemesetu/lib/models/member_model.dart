class MemberModel {
  final String id;
  final String name;
  final String mobile;
  final String address;
  final String? photoUrl;
  final List<String> groupIds;
  final String? aadhaarNumber;

  MemberModel({
    required this.id,
    required this.name,
    required this.mobile,
    required this.address,
    this.photoUrl,
    required this.groupIds,
    this.aadhaarNumber,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'mobile': mobile,
      'address': address,
      'photoUrl': photoUrl,
      'groupIds': groupIds,
      'aadhaarNumber': aadhaarNumber,
    };
  }

  factory MemberModel.fromMap(Map<String, dynamic> map, String docId) {
    List<String> parsedGroupIds = [];
    if (map['groupIds'] != null) {
      parsedGroupIds = List<String>.from(map['groupIds']);
    } else if (map['groupId'] != null && map['groupId'].toString().isNotEmpty) {
      parsedGroupIds = [map['groupId'].toString()];
    }

    return MemberModel(
      id: docId,
      name: map['name'] ?? '',
      mobile: map['mobile'] ?? '',
      address: map['address'] ?? '',
      photoUrl: map['photoUrl'],
      groupIds: parsedGroupIds,
      aadhaarNumber: map['aadhaarNumber'],
    );
  }

  MemberModel copyWith({
    String? id,
    String? name,
    String? mobile,
    String? address,
    String? photoUrl,
    List<String>? groupIds,
    String? aadhaarNumber,
  }) {
    return MemberModel(
      id: id ?? this.id,
      name: name ?? this.name,
      mobile: mobile ?? this.mobile,
      address: address ?? this.address,
      photoUrl: photoUrl ?? this.photoUrl,
      groupIds: groupIds ?? this.groupIds,
      aadhaarNumber: aadhaarNumber ?? this.aadhaarNumber,
    );
  }
}
