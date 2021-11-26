# Physical Measures mockup

This is a simple prototype that's trying to demonstrate one possible way to interact with data that is coming from physical sensors.

The idea behind this is to handle the user a simple tool that let him cut a signal wave, observe the result and then use the resultant dataset to make some calculation (std, median, mode etc..).

# How to install

Simply clone this repository and then serve the index.html with whichever web server you like, be it vscode live-server or whatever.

# How to use

This example generates n random data, which can be modified freely in the script and then displays it in the source and result charts. You can use the 4 operation:
- Above
- Belove
- In Between
- Not in between

and specify the min and max thresholds.

You can also Shift-drag onto the source chart, creating multiple time selections. The main button launches the calculations and the result is rendered in the result chart, while the data that is being cut is going to be displayed in red.
