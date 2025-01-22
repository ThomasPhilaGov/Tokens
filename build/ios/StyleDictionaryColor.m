
//
// StyleDictionaryColor.m
//

// Do not edit directly, this file was auto-generated.


#import "StyleDictionaryColor.h"

@implementation StyleDictionaryColor

+ (UIColor *)color:(StyleDictionaryColorName)colorEnum{
  return [[self values] objectAtIndex:colorEnum];
}

+ (NSArray *)values {
  static NSArray* colorArray;
  static dispatch_once_t onceToken;

  dispatch_once(&onceToken, ^{
    colorArray = @[
[UIColor colorWithRed:0.000f green:0.000f blue:0.000f alpha:1.000f],
[UIColor colorWithRed:1.000f green:1.000f blue:1.000f alpha:1.000f],
[UIColor colorWithRed:1.000f green:0.980f blue:0.941f alpha:1.000f],
[UIColor colorWithRed:0.996f green:0.922f blue:0.784f alpha:1.000f],
[UIColor colorWithRed:0.984f green:0.827f blue:0.553f alpha:1.000f],
[UIColor colorWithRed:0.965f green:0.678f blue:0.333f alpha:1.000f],
[UIColor colorWithRed:0.929f green:0.537f blue:0.212f alpha:1.000f],
[UIColor colorWithRed:0.867f green:0.420f blue:0.125f alpha:1.000f],
[UIColor colorWithRed:0.753f green:0.337f blue:0.129f alpha:1.000f],
[UIColor colorWithRed:0.612f green:0.259f blue:0.129f alpha:1.000f],
[UIColor colorWithRed:0.482f green:0.204f blue:0.118f alpha:1.000f]
    ];
  });

  return colorArray;
}

@end