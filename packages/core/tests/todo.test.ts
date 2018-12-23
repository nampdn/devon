import {addTodo} from '../src';

describe('todo', () => {
  it('add todo', () => {
    expect(addTodo('implement unit test')).toHaveProperty('todo');
  });
});
