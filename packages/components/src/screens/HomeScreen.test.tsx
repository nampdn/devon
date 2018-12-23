import React from 'react';
import {create} from 'react-test-renderer';
import {HomeScreen} from './HomeScreen';

describe('HomeScreen', () => {
  it('render and match snapshot', () => {
    const tree = create(<HomeScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
