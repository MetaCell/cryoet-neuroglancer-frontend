# CryoET neuroglancer frontend

This is a frontend to demonstrate a header around the neuroglancer viewer that can interact with the viewer. The current implementation is a prototype and not intended to be used in production immediately. Updates that are sent to the viewer or received from the viewer are any actions that are represented by the neuroglancer viewer state. This includes the position of the viewer, the layers that are visible, the layers that are selected, the data sources that are used, etc.

## Contents

- `applications/cryoet-neuroglancer`: This is the primary folder of interest. It contains the frontend code for the header around the neuroglancer viewer, and helper files for sending and receiving state updates.
- `deployment`: Contains the deployment files for the frontend, can be largely ignored.

## Neuroglancer changes

Neuroglancer is contained in an iframe, which is using the version of neuroglancer from https://github.com/MetaCell/neuroglancer/tree/cryoet-demo-minimal. This version of neuroglancer is a fork of the main neuroglancer repository, with some modifications to the code to allow for the sending and receiving of state updates. One of the main advantages of the strategy here is that the code changes are minimal, and listed below (at the end of `main.ts`):

```typescript
const originalReplaceState = history.replaceState;
history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    window.parent.postMessage({
        type: 'synchash',
        hash: window.location.hash,
        // state: args[0],
      }, '*');
};

window.addEventListener('message', (event) => {
    const {type, hash} = event.data
    if (type === 'hashchange' && window.location.hash !== hash) {
        window.location.hash = hash;
    }
});
```

In the future, it is possible that a more comprehensive change could be integrated into main neuroglancer to enable this kind of functionality via hooks.