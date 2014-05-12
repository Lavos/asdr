# ASDR

An asynchronous, dependency-resolving library framework.

This framework allows you to create your own hybrid library for your own uses. This is a generic version of what our company calls "Clarity."

## It's like Google Analytics because...

... you can push "commands," or what ASDR has called _work objects_, into the library as a queue before the library script is downloaded and executed. Once the script is done loading, the work objects are procesesed and the API remains the same.

## It's like Require.js / AMD because...

... your _work objects_ specify which modules you would to use. The script for these modules are pre-bundled into the main library, but are unexecuted until a _work object_ requires a given module.

## It's great because...

### Minimal Requests
There's no AJAX'ing for additional resources, so it's super fast. Your entire library (modules, template, and styles) is in a single file that can be cached, CDN'd, minified, gzipped, and then used throughout your network.

### Namespaced
ASDR libraries Can co-exist with any other framework or code-base. All modules do not escape outside the ASDR library. The entire library is namespaced inside a single global variable of your choosing. Since you create the modules yourself, you can use multiple versions of the same library can co-exist on the same page as separate modules.

Got old code using jQuery 1.2, but you want to use jQuery 2 for everything you are writing now? Create a jQuery 2.0 ASDR module, and now they don't conflict!

## It's no so great because...

### Bigger File
The same file is used in each context, so *all* code is on *all* sites.

### Code Redundancy
It's good to be able to have multiple versions of jQuery on the page... but you really shouldn't make your customers download jQuery multiple times.

### Non-Dynamic
The library is not pre-processed on request, so no request-specific code can exist.


