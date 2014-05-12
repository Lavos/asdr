# ASDR

An asynchronous, dependency-resolving library framework for JavaScript.

This framework allows you to create your own hybrid library for your own uses. This is a generic version of what our company calls "Clarity."

## It's like Google Analytics because...

... you can push "commands," or what ASDR has called _work objects_, into the library as a queue before the library script is downloaded and executed. Once the script is done loading, the _work objects_ are procesesed and the API remains the same.

## It's like Require.js / AMD because...

... your _work objects_ specify which modules you want to use. The script for these modules are pre-bundled into the main library, but are unexecuted until a _work object_ requires a given module.

## It's great because...

### Minimal Requests
There's no AJAX'ing for additional resources, so it's super fast. Your entire library (modules, template, and styles) is in a single file that can be cached, CDN'd, minified, gzipped, and then used throughout your network.

### Namespaced
ASDR libraries can co-exist with any other framework or code-base. All modules should not escape outside the ASDR library. The entire library is namespaced inside a single global variable of your choosing. Since you create the modules yourself, you can use multiple versions of the same library on the same page as separate modules.

Got old code using jQuery 1.2, but you want to use jQuery 2 for everything you are writing now? Create a jQuery 2.0 ASDR module, and now they don't conflict!

## It's not so great because...

### Bigger File
The same file is used in each context, so *all* code is on *all* sites.

### Code Redundancy
It's good to be able to have multiple versions of jQuery on the page... but you really shouldn't make your customers download jQuery multiple times.

### Non-Dynamic
The library is not pre-processed on request, so no request-specific code can exist.

## Compiling

ASDR libraries are "compiled" by the `make.sh` script. This script handles the proper execution order, minifying, and mashing.

```bash
./make.sh [namespace] [min|src| > [library file]
```

`namespace` can be any JavaScript friendly variable name.
`min|src` specifies which type of script you would like to return.

`make.sh` outputs to STDOUT, so you will need to redirect output via `>` to the `library file` you want.

### Example

```bash
./make.sh TESTING min > /var/www/scripts/testing.js
```

`/var/www/scripts/testing.js` will be the compiled minified version of your ASDR exposed as TESTING (`window.TESTING`) in the JavaScript global scope.

## Development

There's 3 types of items that can be bundled by the `make.sh` script to make your ASDR library. `make.sh` looks for each in a specific directory in `./src`.

### Modules

Modules are the main item type you will be creating for your ASDR library. Place your modules in `./src/modules`.

Modules are comprised of various pieces of information that are passed to the ASDR library function `provide`.

```js
__LIBRARY_NAME__.provide('module_name', ['depA', 'depB'], function(depA, depB){ return module_value; });
```

1. `__LIBRARY_NAME__`: A placeholder string that gets replaced with your specified namespace by `make.sh`. You should not have to change this.
2. `module_name`: The name other modules and work-objects will refer to this module as once it's registered.
3. `['depA', 'depB']`: An array of names of other modules this module requires to function. If this module has no dependencies, pass an empty array (`[]`).
4. `function(depA, depB){}`: The closure your module code resides in. This code only gets executed when another module or work object specifies this module as a dependency. Each dependency you specify in the previous argument gets their value exposed as whatever argument name you specify, in order of inclusion.
5. `return module_value;`: Each module should return a value so that other modules and work objects can receieve your code as arguments to their closures.

ASDR stores all calls to provide without executing them. Once another module or work object that requires your module is executed, your module code is executed. Your module's code is executed *once*, cached internally by ASDR, and then passed by *reference* in most cases. A good pattern is to return a constructor function with your module, and then initialize a new instance within your implementation code.

#### Example

```js
__LIBRARY_NAME__.provide('bluemaker', ['jquery', 'underscore'], function($, _){
	var BlueMaker = function BlueMaker (element) {
		this.$element = $(element);
	};

	BlueMaker.prototype.blues = ['blue', 'lightblue', 'cornflowerblue', 'steelblue'];

	BlueMaker.prototype.makeBlue = function makeBlue () {
		this.$element.css('color', this.blues[_.random(0, this.blues.length-1]));
	};

	return BlueMaker;
});
