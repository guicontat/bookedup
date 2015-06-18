<?php

// src/BU/PlatformBundle/Controller/AdvertController.php

namespace BU\PlatformBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;


class AdvertController extends Controller
{
	public function indexAction()
	{
		return $this->render('BUPlatformBundle:Advert:index.html.twig', array(
			'nom' 			=> 'Guillaume Contat', 
			'activate' 		=> 'Activer le son', 
			'desactivate' 	=> 'Désactiver le son', 
			'start_stream' 	=> 'Lancer le stream',
			'body_css_url'  => 'body.css',
			'main_js_url'	=> 'scripts/main.js',
			'require_js_url'=> 'scripts/require.js',
			'stop_stream' 	=> 'Stopper le stream',
			'play'			=> 'Jouer un morceau',
			'stop'			=> 'Arrêter le morceau',
			)
		);
	}

	public function showAction()
	{	
		if($blog == hello-world)
			return $this->render('BUPlatformBundle:Advert:index.html.twig', array('home' => $home,));
		if($blog == byebye-world)
			return $this->render('BUPlatformBundle:Advert:index.html.twig', array('home' => $home,));
	}

}