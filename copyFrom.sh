#!bin/bash

if [[ $# -eq 0 ]] ; then
    echo 'Please, give the absolute path to the root folder of the development version of ctaOperatorGUI from which the new files will be copied here'
    exit 0
fi

from=$1
to="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

mkdir -p $to/ctaGuiFront/ctaGuiFront/js/
mkdir -p $to/ctaGuiFront/ctaGuiFront/py/
mkdir -p $to/ctaGuiFront/ctaGuiFront/templates/
mkdir -p $to/ctaGuiFront/ctaGuiFront/styles/


# Plotly style
cp $from/ctaGuiFront/ctaGuiFront/styles/plotly-style.html $to/ctaGuiFront/ctaGuiFront/styles/

# Plotly web-components
cp $from/ctaGuiFront/ctaGuiFront/templates/light-curve.html $to/ctaGuiFront/ctaGuiFront/templates/

# New Widgets
cp $from/ctaGuiFront/ctaGuiFront/js/widget_analysisWidget.js $to/ctaGuiFront/ctaGuiFront/js/
cp $from/ctaGuiFront/ctaGuiFront/py/widget_analysisWidget.py $to/ctaGuiFront/ctaGuiFront/py/
