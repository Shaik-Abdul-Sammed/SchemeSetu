import 'package:flutter/material.dart';
import 'package:chit_fund_app/utils/theme.dart';

class ScrollArrowsOverlay extends StatelessWidget {
  final ScrollController? scrollController;
  final Widget child;
  final double bottomPadding;
  final double rightPadding;

  const ScrollArrowsOverlay({
    super.key,
    this.scrollController,
    this.bottomPadding = 20,
    this.rightPadding = 20,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final controller = scrollController ?? PrimaryScrollController.of(context);

    return Stack(
      children: [
        child,
        Positioned(
          bottom: bottomPadding,
          right: rightPadding,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              FloatingActionButton.small(
                heroTag: null, // Avoid hero tag conflicts
                backgroundColor:
                    AppTheme.primaryTeal.withAlpha(230), // 0.9 alpha
                foregroundColor: Colors.white,
                onPressed: () {
                  if (controller.hasClients) {
                    controller.animateTo(
                      0,
                      duration: const Duration(milliseconds: 500),
                      curve: Curves.easeInOut,
                    );
                  }
                },
                child: const Icon(Icons.arrow_upward_rounded),
              ),
              const SizedBox(height: 8),
              FloatingActionButton.small(
                heroTag: null, // Avoid hero tag conflicts
                backgroundColor: AppTheme.primaryTeal.withAlpha(230),
                foregroundColor: Colors.white,
                onPressed: () {
                  if (controller.hasClients) {
                    controller.animateTo(
                      controller.position.maxScrollExtent,
                      duration: const Duration(milliseconds: 500),
                      curve: Curves.easeInOut,
                    );
                  }
                },
                child: const Icon(Icons.arrow_downward_rounded),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
