<?php

namespace BU\PlatformBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('BUPlatformBundle:Default:index.html.twig', array('name' => $name));
    }
}
