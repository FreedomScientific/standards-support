/**
 * define CSS properties and values
 * @type {Object}
 */
const cssProps = {
	opacity: [0, .25],
	display: ['contents','block','inline','run-in','flow','flow-root','flex','ruby','subgrid','list-item','table','table-row-group','table-header-group','table-footer-group','table-row','table-cell','table-column-group','table-caption'],
	height: [0, '1px', '4em'],
	width: [0, '1px', '4em'],
	isolation: ['auto', 'isolate'],
	'overflow-wrap': ['break-word'],
	'word-spacing': [0, '4em'],
	'list-style': ['square', 'inside', 'none inside', 'georgian inside', 'none'],
	order: [0, 2, 5, 4, '-2', 1],
	direction: ['ltr', 'rtl'],
	'text-indent': [0, '20em', '-999999px'],
	'writing-mode': ['horizontal-tb', 'vertical-rl', 'vertical-lr'],
	overflow: ['hidden', 'scroll', 'auto', 'visible'],
	resize: ['none', 'both', 'horizontal', 'vertical'],
	'pointer-events': ['auto', 'none', 'inherit', 'unset']
};

const paramKey = 'prop';

/**
 * [description]
 */
const getParams = () => location.search && JSON.parse('{"' + decodeURI(location.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');

/**
 * [description]
 */
(() => {
	const propName = getParams()[paramKey];
	const props = propName && cssProps[propName] || [];
	const testTarget = document.querySelectorAll('.css-test__cases');

	props.forEach(prop => {
		testTarget.forEach(test => {
			let newTest = test.cloneNode(true);
			newTest.classList.remove('css-test__cases--source');

			newTest.querySelectorAll('.css-test-target').forEach(el => {
				el.style[propName] = prop;

				let context = el.querySelector('.css-test-target__code');
				if (context) {
					context.innerHTML = propName + ': ' + prop;
				}
			});

			test.parentNode.appendChild(newTest);
		});
	});
})();
