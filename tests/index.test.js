import { diff, merge } from "../src";
it("Should be ok", function() {
  //
  // expect(diff).toMatchSnapshot();
  let data = {
    foo: "foo",
    bar: "bar"
  };

  let $merge = { foo: "FOO" };

  let { rollback } = merge(data, $merge);

  expect(data).toMatchSnapshot();
  
  merge(data, rollback)
  
  expect(data).toMatchSnapshot();

  const $diff = diff(data, $merge);

  expect($diff).toMatchSnapshot();
});
