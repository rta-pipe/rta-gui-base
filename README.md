# RTA-base-GUI

This repository contains the new widgets for the rta scientific gui that is based on the [https://github.com/IftachSadeh/ctaOperatorGUI](Iftach's ctaOperatorGUI).

## Development flow
* Open branch
* Develop
  * Import a new web component from RTA-GUI-components in ctaOperatorGUI
    * copy the component in the template folder
    * import the component file in the template/view_common.jinja2 file
  * Add the web component into a widget
    * [Optional] Create a new widget
      * execute the utility script located at the bottom of the README
      * add the new widget to the allowed widgets (in ctaGUIUtils/py/utils.py)
      * add the new widget to the view 300 (in js/utils_setupView.js)
      * write the code of the new widget importing the new web component
  * Run the GUI, check for any errors
  * Go to RTA-base-GUI repo and checkout a new branch
  * Add the new files with the copyFrom.sh script:
    ```bash
      ./copyFrom.sh <absolute-path-to-ctaOperatorGUI-dir>
    ```
  * Commit, push on branch and open a pull request
  * When the pull request is accepted and the branch is merged to the master:
    * Checkout on master
    * git pull origin master
    * delete branch

## How to merge the ctaOperatorGUI with the new widgets
- Clone the Iftach's ctaOperatorGUI with:
  ```bash
    git clone https://github.com/IftachSadeh/ctaOperatorGUI
  ```
- Call the following script that copy all the files present in this repo in the ctaOperatorGUI. The script takes in input the absolute path to the root folder of the ctaOperatorGUI.
  ```bash
    ./copyTo.sh <absolute-path-to-ctaOperatorGUI-dir>
  ```
  The script will copy:
  - the external web-components created with Polymer and Plotly (.html).
  - the new custom widgets (.js and .py).
  - the plotly css stylesheet.

- Install new dependencies:
  - install the following packages with bower:
    ```bash
      cd ctaOperatorGUI/ctaGuiFront/
      bower install https://github.com/plotly/plotly.js.git#v1.39.2 --save
      bower install https://github.com/mathjax/MathJax.git#2.7.5 --save
      bower install bwt-datatable --save
      bower install web-animations-js --save
    ```


- Modify the following files:
  -  ctaGuiFront/ctaGuiFront/templates/*new components*
    - remove all the imports located on top of the files

  - ctaGuiFront/ctaGuiFront/templates/view_common.jinja2
    - For each external web-component copied inside the /ctaGuiFront/ctaGuiFront/template folder, import each web-component with:
      ```html
        <link rel="import" href="/templates/<component name>.html">
      ```
    * Add the following imports:
      ```html
        <link rel="import" href="/bower_components/bwt-datatable/bwt-datatable.html">
        <link rel="import" href="/bower_components/bwt-datatable/bwt-datatable-card.html">
        <link rel="import" href="/bower_components/web-animations-js/web-animations-next.min.html">
      ```
  - ctaGuiUtils/py/utils.py
    - Add to the 'allowedWidgetTypeV' object, within the 'synced' list, the name of all the new custom widgets.

  - ctaGuiFront/ctaGuiFront/js/utils_setupView.js
    - Build the views of the rta scientific GUI by defining each view and by adding widgets to them. See code for examples.

  - ctaGuiFront/ctaGuiFront/__init__.py
    - Add the views to the utils.allWidgets list.

  - ctaGuiFront/ctaGuiFront/templates/utils_webComp.html
    - Add the home page links to the views. If the links are added to the <paper-listbox id="siteNavMenu"> tag, every users can see them. It is possible to hide certains links to 'guest' users and make them visible only for the 'developer' users. In order to do so, create the link dynamically in the addDevItem(nTry), see code for examples.

    - ctaGuiFront/ctaGuiFront/templates/utils_widgets.html
      - Rename the 'CTA operator GUI' titles with custom ones. Search for those strings.

    - ctaGuiFront/ctaGuiFront/templates/view_common.jinja2
      - Rename the 'CTA' title tag with a custom one.

    - (optional) ctaGuiUtils/py/utils_redis.py
      - If you are using Redis with authentication, give the password to the Redis connection method:
      ```python
        self.redis = redis.StrictRedis(host=host, port=port, db=3, password=redisPassword)
      ```

- Rename the ctaOperatorGUI folder.


## Add a new plotly widget in the ctaOperatorGUI (this is based on Plotly Example Widget)
```bash
tag0="plotlyWebComp"
tag1="plotlywebcomp"
tag2="PlotlyWebComp"

cd ctaGuiFront/ctaGuiFront
sed "s/emptyPlotlyExample/${tag0}/g" js/widget_emptyPlotlyExample.js | sed "s/emptyplotlyexample/${tag1}/g" | sed "s/EmptyPlotlyExample/${tag2}/g" > js/widget_${tag0}.js
sed "s/emptyPlotlyExample/${tag0}/g" py/widget_emptyPlotlyExample.py | sed "s/emptyplotlyexample/${tag1}/g" | sed "s/EmptyPlotlyExample/${tag2}/g" > py/widget_${tag0}.py
```
