// Widget Config
const WIDGET_ID = 'csv-search-widget';

// create helper function to log an error
function getWidgetRoot() {
  return  document.getElementById( WIDGET_ID );
}

function checkWidgetRoot() {
  const widgetRoot = getWidgetRoot();
  if(!widgetRoot) throw new Error(`Widget Root Error: container with id ${WIDGET_ID} not found`);
  return widgetRoot;
}

function main() {
  try {
    checkWidgetRoot();
    return "main success 1";

  } catch(error) {
    throw new Error('main error: ', error.message);
  }
}

main();

