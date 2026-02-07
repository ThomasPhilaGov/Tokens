
//
// tokens.m
//

// Do not edit directly, this file was auto-generated.


#import ".h"

@implementation 

+ (UIColor *)color:()colorEnum{
  return [[self values] objectAtIndex:colorEnum];
}

+ (NSArray *)values {
  static NSArray* colorArray;
  static dispatch_once_t onceToken;

  dispatch_once(&onceToken, ^{
    colorArray = @[
[UIColor colorWithRed:0.059f green:0.302f blue:0.565f alpha:1.000f],
[UIColor colorWithRed:0.129f green:0.463f blue:0.824f alpha:1.000f],
[UIColor colorWithRed:0.267f green:0.267f blue:0.267f alpha:1.000f],
[UIColor colorWithRed:0.588f green:0.788f blue:1.000f alpha:1.000f],
[UIColor colorWithRed:0.145f green:0.808f blue:0.969f alpha:1.000f],
[UIColor colorWithRed:0.953f green:0.776f blue:0.075f alpha:1.000f],
[UIColor colorWithRed:0.976f green:0.576f blue:0.000f alpha:1.000f],
[UIColor colorWithRed:0.345f green:0.753f blue:0.302f alpha:1.000f],
[UIColor colorWithRed:1.000f green:0.937f blue:0.635f alpha:1.000f],
[UIColor colorWithRed:0.996f green:0.816f blue:0.816f alpha:1.000f],
[UIColor colorWithRed:0.725f green:0.949f blue:0.694f alpha:1.000f],
[UIColor colorWithRed:0.855f green:0.929f blue:0.996f alpha:1.000f],
[UIColor colorWithRed:0.227f green:0.514f blue:0.235f alpha:1.000f],
[UIColor colorWithRed:0.800f green:0.188f blue:0.000f alpha:1.000f],
[UIColor colorWithRed:0.580f green:0.000f blue:0.776f alpha:1.000f],
[UIColor colorWithRed:0.000f green:0.000f blue:0.000f alpha:1.000f],
[UIColor colorWithRed:0.631f green:0.631f blue:0.631f alpha:1.000f],
[UIColor colorWithRed:0.812f green:0.812f blue:0.812f alpha:1.000f],
[UIColor colorWithRed:0.941f green:0.941f blue:0.941f alpha:1.000f],
[UIColor colorWithRed:1.000f green:1.000f blue:1.000f alpha:1.000f],
[UIColor colorWithRed:1.000f green:0.969f blue:0.816f alpha:1.000f],
[UIColor colorWithRed:0.863f green:0.973f blue:0.847f alpha:1.000f],
[UIColor colorWithRed:0.996f green:0.906f blue:0.906f alpha:1.000f]
    ];
  });

  return colorArray;
}

@end