# tin-slide-js
Dependency free content slider for Javascript

## Website
See TinSlide in action @ [tin-slide.com](https://tin-slide.com "TinSlide website")

## Installation options
```
yarn add tin-slide --save
```
```
npm install tin-slide --save
```
```
bower install tin-slide --save
```

## Usage
As a module
```
import TinSlide from 'tin-slide';

TinSlide(document.getElementById('TinSlide'), {
    // Options.
});
```

### Script tag
You can choose to load the script separately, or implement the script in your pre processor any way you like.
```
<script src="node_modules/tin-slide/dist/tin-slide.js"></script>
```