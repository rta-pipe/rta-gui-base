#!bin/bash

if [[ $# -eq 0 ]] ; then
    echo 'Please, give the absolute path to the root folder of ctaOperatorGUI in which the new files will be installed'
    exit 0
fi

from="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
to=$1

# Plotly style
cp $from/ctaGuiFront/ctaGuiFront/styles/plotly-style.html $to/ctaGuiFront/ctaGuiFront/styles/

# Plotly web-components
cp $from/ctaGuiFront/ctaGuiFront/templates/webcomp-example.html $to/ctaGuiFront/ctaGuiFront/templates/
cp $from/ctaGuiFront/ctaGuiFront/templates/light-curve.html $to/ctaGuiFront/ctaGuiFront/templates/
cp $from/ctaGuiFront/ctaGuiFront/templates/data-quality-histogram.html $to/ctaGuiFront/ctaGuiFront/templates/
echo 'New templates: webcomp-example.html, light-curve.html, data-quality-histogram.html'

# New Widgets
cp $from/ctaGuiFront/ctaGuiFront/js/widget_analysisWidget.js $to/ctaGuiFront/ctaGuiFront/js/
cp $from/ctaGuiFront/ctaGuiFront/py/widget_analysisWidget.py $to/ctaGuiFront/ctaGuiFront/py/
echo 'New widgets: widget_analysisWidget, '
