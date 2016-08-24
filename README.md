# MuViAS

MuViAS stands for Multidimensional Visualization and Analysis Suite

## Introduction
The idea behind this project is to create an application using Nasa Web WorldWind to show metadata about environmental variables in more than three dimensions. The model implemented to present 3D data is a Voxel model. 
Each voxel has three dimensions that will be possible to customize with the interested metadata, but also more information can be shown thanks to Web WorldWind capabilities. <br> The color of each Voxel present a variable in the dataset and additionally creating an animation in time gives the opportunity to introduce a further variable. 
Users can interact with the visualization, customizing the variables to show on the Voxels and filtering data according to specific settings.<br>
This projects participate in the Google Summer of Code 2016.
More information about it can be found here
[OSGeo Wiki](https//wiki.osgeo.org/wiki/NASA_Web_WorldWind_Multidimension_Visualization_Tool_GSoC_2016)

The official website presenting the application can be found here [MuViAS](http://131.175.59.193/gabriele/)


## Testing
* Download all the files
* Open the index.html
* An automatic tour will start and guide you through the application

## Use the application
### Import a point feature dataset

To import a dataset the application provides a 'select file' box that allows choosing a file in your computer and importing it inside the application.
It is also possible to choose a file available online, inserting the link to the file location. 
The file should have a .CSV format and contain the following columns in any order:

Latitude
Longitude
Time
Variable optional

After having selected the file, click on the Load Configuration button to select the appropriate kind of file (Georeferenced CSV).
Now the application, under the Georeferenced CSV menu, will show all the options to import the file correctly.

To customize the environment, from the dropdown menu, click on Advanced Options and select the required parameters.

### Browse the data

When the data is successfully imported, it will be shown over the globe. You will see some doxels representing the data, in particular the color will represent the first selected variable.
The layers of time will be shown according to the time-step selected in the Advanced Options panel during the importing of the data.
From the left panel  you can use all the available filters, browse through the time, and customize many options.
![menu](http://131.175.59.193/gabriele/images/menu_button.jpg)

To obtain information about a doxel, you can select from the top bar the Point Info selector and click on a doxel. 

![handler](http://131.175.59.193/gabriele/images/click_handler.jpg)

A panel showing some statistics will appear on the bottom

![statistics](http://131.175.59.193/gabriele/images/stat_panel.jpg)


To create some spatial cluster, you can instead click on the top bar, selecting the Big Doxels selector. Automatically the doxels will be grouped according to the group defined during the importing of the data. By default the color will represent the weighted average.

![grouped](http://131.175.59.193/gabriele/images/grouped.jpg)


## License
NASA Open Source Agreement v1.3 (NASA-1.3)


