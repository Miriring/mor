import Index from 'views/index'
import Hammer from 'views/hammer'
import MountRoot from 'views/mount-root'
import Toast from 'views/toast'

export default {
	index: 'index',
	routes: {
		'404': Index,
		'index': Index,
		'hammer': Hammer,
		'mount-root': MountRoot,
		'toast': Toast
	}
}
