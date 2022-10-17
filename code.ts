// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { height: 320});

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.

  let createContentHolder = (parentFrameId: any, elementWidth: number, parentHeight: number, name: string) => {
    const frame = figma.createFrame();
    frame.layoutPositioning = 'AUTO';
    frame.name = name;
    frame.verticalPadding = 24;
    frame.horizontalPadding = 24;
    frame.itemSpacing = 16;
    frame.resize(elementWidth, parentHeight);
    const node = figma.getNodeById(parentFrameId);
    if (node && node.type === 'FRAME') {
      node.appendChild(frame);
      if (name === 'Content' && node.name.includes('desktop')) {
        frame.layoutMode = 'HORIZONTAL';
        const col_16 = figma.createFrame();
        const col_8 = figma.createFrame();
        col_16.resize(763, parentHeight);
        col_8.resize(373, parentHeight);
        frame.appendChild(col_16);
        frame.appendChild(col_8);
      }
      else if (name === 'Tablet' && node.name.includes('mobile')) {
        frame.layoutMode = 'HORIZONTAL';
      }
      else if (name === 'Content' && node.name.includes('mobile')) {
        frame.layoutMode = 'VERTICAL';
      }
    }
  }

  if (msg.type === 'create-frame') {

    // Find all the frames in the document
    let frameCount: number = 0;
    let lastNodeId: string = '';
    let lastFrameXEnd: number = 0;

    for (const node of figma.currentPage.children) {
      if (node.type === 'FRAME') {
        frameCount = parseInt(node.name.split(' ')[0]);
        if (node.name.includes('desktop')) {
          lastNodeId = node.id;
        }
      }
    }

    // Get the name of the latest one, and get its position
    let lastFrame = figma.getNodeById(lastNodeId);
    if (lastFrame && lastFrame.type === 'FRAME') {
      lastFrameXEnd = lastFrame.x + lastFrame.width;
    }

    // Calculate the new frame index, initialise the x, y and layoutMode
    let newIndex = frameCount + 100;
    let x, y = 0;
    let sidebarSize = 240;

    // For each screen resolution selected,
    msg.data.resolutions.map((resolution: string) => {
      // Create a frame
      const frame = figma.createFrame();
      // Set its layout
      frame.layoutMode = 'HORIZONTAL';
      if (resolution === 'desktop') {
        y = 0;
        frame.resize(1440, 1024); // Desktop Large
        createContentHolder(frame.id, sidebarSize, frame.height, 'Sidebar');
      } else if (resolution === 'tablet') {
        y = 1500;
        frame.resize(1194, 834); // iPad 11" - Landscape
        sidebarSize = 0;
      } else if (resolution === 'mobile') {
        frame.layoutMode = 'VERTICAL';
        y = 2500;
        frame.resize(360, 800); // Android - Large
        sidebarSize = 0;
      }
      // Move the frame 150 px to the right of the last frame
      frame.x = lastFrameXEnd + 150;
      frame.y = y;
      frame.name = `${newIndex} - ${resolution} - ${msg.data.useCaseName}`;
      createContentHolder(frame.id, frame.width - sidebarSize, frame.height, 'Content');
    });

  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
