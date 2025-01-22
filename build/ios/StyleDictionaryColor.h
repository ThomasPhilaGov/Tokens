
//
// StyleDictionaryColor.h
//

// Do not edit directly, this file was auto-generated.


#import <UIKit/UIKit.h>

typedef NS_ENUM(NSInteger, StyleDictionaryColorName) {
ColorsBlack,
ColorsWhite,
ColorsOrange100,
ColorsOrange200,
ColorsOrange300,
ColorsOrange400,
ColorsOrange500,
ColorsOrange600,
ColorsOrange700,
ColorsOrange800,
ColorsOrange900
};

@interface StyleDictionaryColor : NSObject
+ (NSArray *)values;
+ (UIColor *)color:(StyleDictionaryColorName)color;
@end