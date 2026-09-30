import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'module_provider.g.dart';

enum AppModule { hub, chitFund, shg }

@Riverpod(keepAlive: true)
class ActiveModule extends _$ActiveModule {
  @override
  AppModule build() => AppModule.hub;

  void set(AppModule module) => state = module;
}
