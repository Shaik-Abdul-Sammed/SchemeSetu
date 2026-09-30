import 'app_database.dart';
import 'shg_dao.dart';
import 'app_dao.dart';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  factory DatabaseHelper() => _instance;
  DatabaseHelper._internal();

  late final AppDatabase _db;

  void init(AppDatabase db) {
    _db = db;
  }

  AppDatabase get database => _db;
  SHGDao get shgDao => _db.sHGDao;
  AppDao get appDao => _db.appDao;

  Future<void> close() async {
    await _db.close();
  }
}
