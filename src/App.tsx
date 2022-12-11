import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { proxy, snapshot, useSnapshot } from "valtio";
import "./App.css";

type Item = {
  id: string;
  title: string;
};

const store = proxy({
  items: {
    a: { title: "A", id: "a" },
    b: { title: "B", id: "b" },
    c: { title: "C", id: "c" },
    d: { title: "D", id: "d" },
  } as Record<string, Item>,
  groups: {
    foo: {
      itemIds: ["a", "b"],
    },
    bar: {
      itemIds: ["c", "d"],
    },
  },
});

function Group({ id, label }: { id: "foo" | "bar"; label?: string }) {
  const { items, groups } = useSnapshot(store);
  const groupItems = useMemo(
    function () {
      // I want to memoize this map operation
      return groups[id].itemIds.map((itemId) => items[itemId]);
    },
    [groups, id, items]
  );
  return (
    <div>
      <h3>Group: {label ?? id}</h3>
      <ul>
        {groupItems.map(({ id, title }) => (
          <li key={id}>{title}</li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const handleClick = useCallback(() => {
    const item = { id: nanoid(), title: nanoid().toUpperCase() };
    store.items[item.id] = item;
    store.groups[Math.random() > 0.5 ? "foo" : "bar"].itemIds.push(item.id);
    console.log(snapshot(store.groups));
  }, []);
  const [labelFoo, setLabelFoo] = useState<string>();
  const [labelBar, setLabelBar] = useState<string>();
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLabelFoo(nanoid());
      setLabelBar(nanoid());
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="App">
      <button onClick={handleClick} style={{ color: "red", fontWeight: "900" }}>
        Add a random item
      </button>
      <Group id="foo" label={labelFoo} />
      <Group id="bar" label={labelBar} />
    </div>
  );
}

export default App;
