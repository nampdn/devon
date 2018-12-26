declare module 'react-native-web' {
  export * from 'react-native'
}

namespace JSX {
  import * as ReactNative from 'react-native'
  interface IntrinsicAttributes extends React.Attributes {
    accessibilityRole?:
      | ReactNative.AccessibilityRole
      | 'article'
      | 'banner'
      | 'button'
      | 'complementary'
      | 'contentinfo'
      | 'form'
      | 'heading'
      | 'label'
      | 'link'
      | 'list'
      | 'listitem'
      | 'main'
      | 'navigation'
      | 'region'

    className?: string
  }
}
