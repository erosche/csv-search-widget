// Widget Config
const WIDGET_ID = 'csv-search-widget';

// create helper function to log an error
function getWidgetRoot() {
  return  document.getElementById( WIDGET_ID );
}

function checkWidgetRoot() {
  let widgetRoot;

  try {
    widgetRoot = getWidgetRoot();
  } catch(error) {
    throw new Error('Widget Root Error: ', error.message);
  }
  return widgetRoot;
}

function main() {
  try {
    checkWidgetRoot();
    return "main success 1";

  } catch(error) {
    throw new Error('main error: ', error);
  }
}

main();

